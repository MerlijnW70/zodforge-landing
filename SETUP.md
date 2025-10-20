# ZodForge Cloud - Revenue-Ready MVP Setup Guide

This guide will walk you through setting up the complete payment and email system for ZodForge Cloud.

**Estimated Time**: 30-45 minutes

---

## 📋 Prerequisites

- [x] Landing page built (you have this!)
- [ ] Stripe account
- [ ] Supabase account
- [ ] Resend account
- [ ] Vercel account (for deployment)

---

## 1️⃣ Stripe Setup (15 minutes)

### Step 1.1: Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Sign up with your email
3. Complete business information (can use test mode initially)

### Step 1.2: Get API Keys

1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy your **Secret key** (starts with `sk_test_...`)
3. Copy your **Publishable key** (starts with `pk_test_...`)
4. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_51...
   STRIPE_PUBLISHABLE_KEY=pk_test_51...
   PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
   ```

### Step 1.3: Create Products

1. Go to **Products** → **Add product**
2. Create **2 products**:

**Product 1: Pro Plan**
- Name: `ZodForge Cloud - Pro`
- Description: `5,000 requests/month with OpenAI + Claude fallback`
- Pricing: `$19/month` (recurring)
- Copy the **Price ID** (starts with `price_...`)

**Product 2: Enterprise Plan**
- Name: `ZodForge Cloud - Enterprise`
- Description: `Unlimited requests with all AI providers`
- Pricing: `$99/month` (recurring)
- Copy the **Price ID** (starts with `price_...`)

### Step 1.4: Update Pricing Component

Edit `src/components/Pricing.astro` and replace `stripePriceId` values:

```typescript
// Pro tier
stripePriceId: 'price_1AbC2dEfGhI3JkL4mN5oPq6r', // Your actual Pro price ID

// Enterprise tier
stripePriceId: 'price_7XyZ8WvU9TsR0qP1oN2mL3k', // Your actual Enterprise price ID
```

### Step 1.5: Set Up Webhook

**Important**: Do this AFTER deploying to Vercel (Step 5 below).

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://YOUR_VERCEL_URL.vercel.app/api/webhook`
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add to Vercel environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## 2️⃣ Supabase Setup (10 minutes)

### Step 2.1: Create Project

1. Go to https://supabase.com/dashboard
2. Click **New project**
3. Project name: `zodforge-cloud`
4. Database password: (generate strong password)
5. Region: Choose closest to your users
6. Wait ~2 minutes for project to be ready

### Step 2.2: Get API Keys

1. Go to **Project Settings** → **API**
2. Copy **Project URL** (https://xyz.supabase.co)
3. Copy **service_role** key (NOT the anon key!)
4. Add to `.env`:
   ```
   SUPABASE_URL=https://xyz.supabase.co
   SUPABASE_SERVICE_KEY=eyJh...
   ```

### Step 2.3: Create Database Tables

1. Go to **SQL Editor**
2. Click **New query**
3. Paste and run this SQL:

```sql
-- Create customers table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL,
  subscription_status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage table
CREATE TABLE usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key TEXT NOT NULL REFERENCES customers(api_key),
  endpoint TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  processing_time_ms INTEGER,
  CONSTRAINT fk_customer FOREIGN KEY (api_key) REFERENCES customers(api_key) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_customers_api_key ON customers(api_key);
CREATE INDEX idx_customers_stripe_id ON customers(stripe_customer_id);
CREATE INDEX idx_usage_api_key ON usage(api_key);
CREATE INDEX idx_usage_timestamp ON usage(timestamp);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- Create policies (service_role bypasses these, but good to have)
CREATE POLICY "Service role has full access to customers"
  ON customers FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to usage"
  ON usage FOR ALL
  USING (auth.role() = 'service_role');
```

4. Click **Run** (bottom right)
5. Verify: Go to **Table Editor** → Should see `customers` and `usage` tables

---

## 3️⃣ Resend Setup (5 minutes)

### Step 3.1: Create Account

1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your email

### Step 3.2: Get API Key

1. Go to **API Keys** in dashboard
2. Click **Create API Key**
3. Name: `ZodForge Cloud Production`
4. Permission: `Sending access`
5. Copy the API key (starts with `re_...`)
6. Add to `.env`:
   ```
   RESEND_API_KEY=re_...
   ```

### Step 3.3: Add Domain (Optional - For Production)

**For testing**: You can send emails from `onboarding@resend.dev`

**For production**:
1. Go to **Domains** → **Add Domain**
2. Enter your domain: `zodforge.dev`
3. Add DNS records to your domain provider
4. Wait for verification (~5-10 minutes)
5. Update webhook email sender in `src/pages/api/webhook.ts`:
   ```typescript
   from: 'ZodForge Cloud <noreply@zodforge.dev>',
   ```

---

## 4️⃣ Update Pricing Component (5 minutes)

Now that you have Stripe Price IDs, let's connect them to the pricing buttons.

Edit `src/components/Pricing.astro`:

```typescript
const pricingTiers = [
  {
    name: 'Free',
    // ... (keep as is)
    cta: 'Start Free',
    ctaLink: '/docs', // Link to docs instead of checkout
  },
  {
    name: 'Pro',
    // ... (keep other fields)
    stripePriceId: 'price_YOUR_PRO_PRICE_ID', // REPLACE THIS
    cta: 'Start Pro Trial',
    ctaLink: '#', // Will be replaced with JavaScript
  },
  {
    name: 'Enterprise',
    // ... (keep other fields)
    stripePriceId: 'price_YOUR_ENTERPRISE_PRICE_ID', // REPLACE THIS
    cta: 'Start Enterprise Trial',
    ctaLink: '#', // Will be replaced with JavaScript
  },
];
```

---

## 5️⃣ Deploy to Vercel (10 minutes)

### Step 5.1: Push to GitHub

```bash
cd zodforge-landing
git init
git add .
git commit -m "feat: Initial ZodForge Cloud landing page with Stripe integration"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zodforge-landing.git
git push -u origin main
```

### Step 5.2: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your `zodforge-landing` repository
3. Framework Preset: **Astro**
4. Build Command: (leave default) `npm run build`
5. Output Directory: (leave default) `dist`
6. Click **Deploy**

### Step 5.3: Add Environment Variables in Vercel

1. After deployment, go to **Project Settings** → **Environment Variables**
2. Add each variable from `.env`:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET` (get from Stripe webhook setup)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `RESEND_API_KEY`
   - `PUBLIC_STRIPE_PUBLISHABLE_KEY`

3. Click **Save**
4. Go to **Deployments** → Click **Redeploy** (to pick up new env vars)

---

## 6️⃣ Test Payment Flow (5-10 minutes)

### Test with Stripe Test Mode

1. Visit your Vercel deployment URL
2. Click on **Start Pro Trial**
3. Use Stripe test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
4. Complete checkout
5. Check email (should receive API key)
6. Check Supabase:
   - Go to **Table Editor** → `customers`
   - Should see new row with your email

### Verify API Key Works

Use the API key from your email:

```bash
curl -X POST https://web-production-f15d.up.railway.app/api/v1/refine \
  -H "Authorization: Bearer zf_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "schema": {
      "code": "z.object({ email: z.string() })",
      "typeName": "User",
      "fields": { "email": "z.string()" }
    },
    "samples": [{ "email": "test@example.com" }]
  }'
```

Should return refined schema!

---

## 🎉 Success Checklist

- [ ] Stripe account created and products configured
- [ ] Supabase database tables created
- [ ] Resend API key obtained
- [ ] Environment variables configured in Vercel
- [ ] Landing page deployed to Vercel
- [ ] Webhook endpoint configured in Stripe
- [ ] Test payment completed successfully
- [ ] Email received with API key
- [ ] Customer record created in Supabase
- [ ] API key works with ZodForge API

---

## 🚨 Troubleshooting

### Webhook not receiving events

1. Check Stripe webhook dashboard for delivery attempts
2. Verify webhook URL is correct: `https://YOUR_DOMAIN.vercel.app/api/webhook`
3. Check Vercel function logs: **Functions** → `api/webhook`
4. Verify `STRIPE_WEBHOOK_SECRET` is set in Vercel

### Email not sending

1. Check Resend dashboard for delivery attempts
2. Verify `RESEND_API_KEY` is correct
3. For production, verify domain is verified in Resend
4. Check Vercel function logs for errors

### Customer not created in Supabase

1. Check Vercel function logs for database errors
2. Verify `SUPABASE_SERVICE_KEY` is the **service_role** key, not anon
3. Verify tables exist in Supabase
4. Check Supabase logs: **Logs** → **Postgres Logs**

---

## 📊 What's Next?

Once setup is complete, you're **revenue-ready**! 🎉

**Optional enhancements**:
- Add usage tracking to zodforge-api (track requests per API key)
- Build admin dashboard to view revenue and customers
- Add email sequences (welcome emails, usage alerts)
- Implement API key management dashboard
- Add team features

---

**Questions?** Check the main README or create an issue on GitHub.

**Built with** [Claude Code](https://claude.com/claude-code)
