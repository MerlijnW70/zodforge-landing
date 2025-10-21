/**
 * Manual Email Resend Script
 *
 * Use this to manually send the API key email to a customer
 * when the webhook failed to send it.
 *
 * Usage:
 *   1. Install dependencies: npm install
 *   2. Set environment variables in .env
 *   3. Run: npx tsx resend-email-manual.ts facturen@multimediagroup.nl
 */

// Load environment variables from .env file
import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

// Get email from command line
const customerEmail = process.argv[2];

if (!customerEmail) {
  console.error('❌ Error: Please provide customer email');
  console.log('Usage: npx tsx resend-email-manual.ts customer@example.com');
  process.exit(1);
}

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !RESEND_API_KEY) {
  console.error('❌ Missing environment variables!');
  console.log('Required: SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY');
  console.log('Create a .env file in zodforge-landing/ with these values');
  process.exit(1);
}

// Initialize services
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const resend = new Resend(RESEND_API_KEY);

// Helper: Generate API key
function generateApiKey(): string {
  const array = new Uint8Array(32);
  crypto.randomFillSync(array);
  return 'zf_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Helper: Hash API key
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

async function resendEmail() {
  try {
    console.log(`🔍 Looking up customer: ${customerEmail}...`);

    // Get customer from database
    const { data: customer, error: dbError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', customerEmail)
      .single();

    if (dbError || !customer) {
      console.error('❌ Customer not found in database!');
      console.log('Please check the email address or Supabase connection.');
      process.exit(1);
    }

    console.log('✅ Customer found:', {
      email: customer.email,
      tier: customer.tier,
      subscription_status: customer.subscription_status,
      created_at: customer.created_at,
    });

    // Check if customer already has an API key
    if (customer.api_key_hash) {
      console.log('⚠️  Customer already has an API key hash in database.');
      console.log('Note: The plaintext key was sent once and cannot be retrieved.');
      console.log('');
      console.log('Options:');
      console.log('1. Generate a NEW API key (old one will be invalidated)');
      console.log('2. Cancel (if customer already received the email)');
      console.log('');

      // For now, we'll generate a new key
      console.log('📝 Generating NEW API key...');
    }

    // Generate new API key
    const newApiKey = generateApiKey();
    const newApiKeyHash = hashApiKey(newApiKey);

    console.log('🔑 New API key generated (will be shown in email)');

    // Update database with new key hash
    const { error: updateError } = await supabase
      .from('customers')
      .update({ api_key_hash: newApiKeyHash })
      .eq('email', customerEmail);

    if (updateError) {
      console.error('❌ Failed to update database:', updateError);
      process.exit(1);
    }

    console.log('✅ Database updated with new API key hash');

    // Send email
    console.log('📧 Sending email...');

    const tier = customer.tier || 'pro';

    await resend.emails.send({
      from: 'ZodForge Cloud <onboarding@resend.dev>',
      to: customerEmail,
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
              <div class="api-key">${newApiKey}</div>

              <h3>Quick Start</h3>
              <p>Use your API key to refine schemas:</p>
              <pre style="background: #1f2937; color: #e5e7eb; padding: 15px; border-radius: 5px; overflow-x: auto;">
curl -X POST https://web-production-f15d.up.railway.app/api/v1/refine \\
  -H "Authorization: Bearer ${newApiKey}" \\
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

    console.log('✅ Email sent successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   Customer: ${customerEmail}`);
    console.log(`   Tier: ${tier.toUpperCase()}`);
    console.log(`   API Key: ${newApiKey.substring(0, 20)}...`);
    console.log('');
    console.log('🎉 Done! Customer should receive email within 1-2 minutes.');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('Possible causes:');
    console.log('1. Invalid Resend API key');
    console.log('2. Email address blocked by Resend');
    console.log('3. Network connection issue');
    console.log('4. Supabase connection issue');
    process.exit(1);
  }
}

// Run the script
resendEmail();
