import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

// Initialize services
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia' as any,
});

const supabase = createClient(
  import.meta.env.SUPABASE_URL || '',
  import.meta.env.SUPABASE_SERVICE_KEY || ''
);

const resend = new Resend(import.meta.env.RESEND_API_KEY || '');

export const prerender = false;

// Helper: Generate API key
function generateApiKey(): string {
  const webcrypto = globalThis.crypto || require('crypto').webcrypto;
  const array = new Uint8Array(32);
  webcrypto.getRandomValues(array);
  return 'zf_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Helper: Hash API key for secure storage
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// Helper: Send API key email
async function sendApiKeyEmail(email: string, apiKey: string, tier: string) {
  try {
    await resend.emails.send({
      from: 'ZodForge Cloud <onboarding@resend.dev>',
      to: email,
      subject: `Your ZodForge Cloud API Key - ${tier.toUpperCase()} Plan`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .api-key { background: #1f2937; color: #10b981; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 14px; margin: 20px 0; word-break: break-all; }
            .cta { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ZodForge Cloud!</h1>
              <p>Your ${tier.toUpperCase()} plan is now active</p>
            </div>
            <div class="content">
              <h2>Your API Key</h2>
              <p>Here's your ZodForge Cloud API key. Keep it secure and never share it publicly:</p>
              <div class="api-key">${apiKey}</div>

              <h3>Quick Start</h3>
              <p>Use your API key to refine schemas:</p>
              <pre style="background: #1f2937; color: #e5e7eb; padding: 15px; border-radius: 5px; overflow-x: auto;">
curl -X POST https://web-production-f15d.up.railway.app/api/v1/refine \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "schema": {
      "code": "z.object({ email: z.string() })",
      "typeName": "User",
      "fields": { "email": "z.string()" }
    },
    "samples": [{ "email": "test@example.com" }]
  }'
              </pre>

              <h3>What's Included</h3>
              <ul>
                <li><strong>${tier === 'pro' ? '5,000' : 'Unlimited'}</strong> requests per month</li>
                <li><strong>OpenAI GPT-4 Turbo</strong> + <strong>Claude 3.5 Sonnet</strong> fallback</li>
                <li><strong>99.99%</strong> uptime SLA</li>
                <li>${tier === 'pro' ? 'Priority support' : 'Dedicated support + custom integrations'}</li>
              </ul>

              <a href="https://zodforge.dev/docs" class="cta">View Documentation</a>
            </div>
            <div class="footer">
              <p>Questions? Reply to this email or visit <a href="https://zodforge.dev">zodforge.dev</a></p>
              <p>© ${new Date().getFullYear()} ZodForge. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('✅ API key email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

export const POST: APIRoute = async ({ request }) => {
  // Get raw body for signature verification
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      import.meta.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('💳 Payment successful:', {
          customer: session.customer,
          email: session.customer_details?.email,
          amount: session.amount_total,
        });

        // Extract customer info
        const customerEmail = session.customer_details?.email;
        const customerId = session.customer as string;
        const tier = session.metadata?.tier || 'pro';

        if (!customerEmail) {
          throw new Error('No customer email found');
        }

        // Generate API key
        const apiKey = generateApiKey();
        const apiKeyHash = hashApiKey(apiKey);

        // Store in Supabase (store hash only, not plaintext)
        const { data, error: dbError } = await supabase
          .from('customers')
          .insert({
            stripe_customer_id: customerId,
            email: customerEmail,
            api_key_hash: apiKeyHash, // Store hash instead of plaintext
            tier: tier,
            subscription_status: 'active',
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }

        console.log('✅ Customer created in database:', data);

        // Send email with API key
        await sendApiKeyEmail(customerEmail, apiKey, tier);

        console.log('🎉 Onboarding complete for:', customerEmail);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        // Update subscription status in database
        const { error: updateError } = await supabase
          .from('customers')
          .update({ subscription_status: status })
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error('Failed to update subscription status:', updateError);
        } else {
          console.log(`✅ Subscription ${status} for customer:`, customerId);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
