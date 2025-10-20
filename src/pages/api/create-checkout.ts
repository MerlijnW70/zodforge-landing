import type { APIRoute } from 'astro';
import Stripe from 'stripe';

// Initialize Stripe with secret key from environment
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia' as any,
});

export const prerender = false; // This is a server-side route

// CORS Configuration
const ALLOWED_ORIGINS = [
  'https://zodforge.dev',
  'https://zodforge-landing.vercel.app',
  ...(import.meta.env.DEV ? ['http://localhost:4321'] : []),
];

// Simple in-memory rate limiting (per IP)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // requests
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const limit = rateLimits.get(ip);

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return { allowed: true };
  }

  if (limit.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil((limit.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  limit.count++;
  return { allowed: true };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. CORS Check
    const origin = request.headers.get('origin');

    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      console.warn('[Security] Blocked request from unauthorized origin:', origin);
      return new Response(
        JSON.stringify({ error: 'Forbidden', message: 'Origin not allowed' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Rate Limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateCheck = checkRateLimit(clientIP);

    if (!rateCheck.allowed) {
      console.warn('[Security] Rate limit exceeded for IP:', clientIP);
      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateCheck.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateCheck.retryAfter)
          }
        }
      );
    }

    console.log('Checkout API called');

    // 3. Request Size Limit (prevent large payloads)
    const contentLength = request.headers.get('content-length');
    const MAX_BODY_SIZE = 10 * 1024; // 10KB

    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      console.warn('[Security] Request payload too large:', contentLength);
      return new Response(
        JSON.stringify({ error: 'Payload Too Large', message: 'Request body exceeds maximum size' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await request.json();
    const { priceId, tier } = body;

    console.log('Request data:', { priceId, tier });

    if (!priceId) {
      console.error('Missing priceId in request');
      return new Response(
        JSON.stringify({ error: 'Missing priceId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating Stripe checkout session...');

    // Get the origin for success/cancel URLs (whitelist for security)
    const requestOrigin = request.headers.get('origin') || request.headers.get('referer') || '';
    const safeOrigin = ALLOWED_ORIGINS.find(allowed => requestOrigin.startsWith(allowed)) || 'https://zodforge.dev';

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
      success_url: `${safeOrigin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${safeOrigin}/#pricing`,
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

    console.log('Session created successfully:', {
      sessionId: session.id,
      url: session.url
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
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      stack: error.stack
    });

    // Sanitize error response for production (don't expose internals)
    const isDev = import.meta.env.DEV;

    return new Response(
      JSON.stringify({
        error: 'Failed to create checkout session',
        message: isDev ? error.message : 'An error occurred while processing your request',
        ...(isDev && { details: error.type || 'unknown_error' }),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
