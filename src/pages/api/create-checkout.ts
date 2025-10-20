import type { APIRoute } from 'astro';
import Stripe from 'stripe';

// Initialize Stripe with secret key from environment
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia' as any,
});

export const prerender = false; // This is a server-side route

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();
    const { priceId, tier } = body;

    if (!priceId) {
      return new Response(
        JSON.stringify({ error: 'Missing priceId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the origin for success/cancel URLs
    const origin = request.headers.get('origin') || 'http://localhost:4321';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      metadata: {
        tier: tier || 'pro', // Store tier for webhook
      },
      subscription_data: {
        metadata: {
          tier: tier || 'pro',
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_email: body.email || undefined, // Optional: pre-fill email
    });

    // Return checkout URL
    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Stripe checkout error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to create checkout session',
        message: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
