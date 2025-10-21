# Stripe Setup Guide - ZodForge Cloud

**Time Required**: 15-20 minutes
**Cost**: Free (test mode), $0 to go live

This guide walks you through setting up Stripe for ZodForge Cloud payments.

---

## Prerequisites

✅ You have a Stripe account (sign up at https://stripe.com)
✅ You're logged into the Stripe Dashboard

---

## Step 1: Create Products and Prices (10 minutes)

### 1.1 Create Pro Plan ($19/month)

1. **Navigate to Products**:
   - In Stripe Dashboard, click **Products** in the left sidebar
   - Click **+ Add product**

2. **Configure Pro Product**:
   ```
   Name: ZodForge Cloud - Pro
   Description: 5,000 AI-powered schema refinements per month with OpenAI + Claude fallback
   ```

3. **Set Pricing**:
   - Click **+ Add another price**
   - Pricing model: **Standard pricing**
   - Price: **$19.00 USD**
   - Billing period: **Monthly**
   - Click **Add price**

4. **Copy Price ID**:
   - After creating, you'll see the price listed
   - Click on the price to view details
   - Copy the **Price ID** (starts with `price_...`)
   - Example: `price_1QJ8kJAbCdEfGhIjKlMnOpQr`
   - **Save this for later**: This is your **PRO_PRICE_ID**

---

### 1.2 Create Enterprise Plan ($99/month)

1. **Add New Product**:
   - Click **Products** → **+ Add product**

2. **Configure Enterprise Product**:
   ```
   Name: ZodForge Cloud - Enterprise
   Description: Unlimited AI-powered schema refinements with all providers, dedicated support, and custom SLA
   ```

3. **Set Pricing**:
   - Click **+ Add another price**
   - Pricing model: **Standard pricing**
   - Price: **$99.00 USD**
   - Billing period: **Monthly**
   - Click **Add price**

4. **Copy Price ID**:
   - Copy the **Price ID** (starts with `price_...`)
   - Example: `price_2AB9xKLmNoPqRsTuVwXyZaBc`
   - **Save this for later**: This is your **ENTERPRISE_PRICE_ID**

---

## Step 2: Get API Keys (2 minutes)

1. **Navigate to Developers**:
   - Click **Developers** in the top right
   - Click **API keys**

2. **Copy Test Keys** (for development):
   - **Publishable key** (starts with `pk_test_...`)
     - Example: `pk_test_51234567890abcdefghijklmnopqrstuvwxyz`
     - Save as: **STRIPE_PUBLISHABLE_KEY**

   - **Secret key** (starts with `sk_test_...`)
     - Click **Reveal test key**
     - Example: `sk_test_51234567890abcdefghijklmnopqrstuvwxyz`
     - Save as: **STRIPE_SECRET_KEY**

3. **⚠️ Important**:
   - NEVER commit secret keys to Git
   - Store them securely in `.env` (which is in `.gitignore`)

---

## Step 3: Update ZodForge Code (5 minutes)

### 3.1 Update Pricing Component

Edit `zodforge-landing/src/components/Pricing.astro`:

Find these lines (around line 35 and 54):

```javascript
// Before:
stripePriceId: 'price_PLACEHOLDER', // Pro tier
stripePriceId: 'price_PLACEHOLDER', // Enterprise tier

// After:
stripePriceId: 'price_YOUR_ACTUAL_PRO_PRICE_ID',      // Replace with Step 1.1
stripePriceId: 'price_YOUR_ACTUAL_ENTERPRISE_PRICE_ID', // Replace with Step 1.2
```

**Example**:
```javascript
{
  name: 'Pro',
  price: '$19',
  period: '/month',
  // ... other fields ...
  stripePriceId: 'price_1QJ8kJAbCdEfGhIjKlMnOpQr', // ✅ Your actual Pro price ID
},
{
  name: 'Enterprise',
  price: '$99',
  period: '/month',
  // ... other fields ...
  stripePriceId: 'price_2AB9xKLmNoPqRsTuVwXyZaBc', // ✅ Your actual Enterprise price ID
},
```

### 3.2 Create Environment File

Create `.env` in `zodforge-landing/`:

```bash
# Copy from .env.example
cp .env.example .env
```

Edit `.env` and add your Stripe keys from Step 2:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE

# Leave these for now (we'll configure in next steps):
STRIPE_WEBHOOK_SECRET=whsec_PENDING
SUPABASE_URL=https://PENDING.supabase.co
SUPABASE_SERVICE_KEY=PENDING
RESEND_API_KEY=re_PENDING
```

---

## Step 4: Test Locally (Optional - 5 minutes)

If you want to test locally before deploying:

```bash
cd zodforge-landing
npm run dev
```

Visit http://localhost:4321 and click "Start Pro Trial". You should see:
- Stripe Checkout page opens
- Shows "$19.00 / month" for Pro
- Test with card: `4242 4242 4242 4242`

---

## Step 5: Configure Webhook (After Vercel Deployment)

⚠️ **Do this AFTER deploying to Vercel** (we'll need the live URL)

1. **In Stripe Dashboard**:
   - Go to **Developers** → **Webhooks**
   - Click **+ Add endpoint**

2. **Configure Endpoint**:
   ```
   Endpoint URL: https://YOUR-VERCEL-URL.vercel.app/api/webhook
   Description: ZodForge Cloud payment webhook
   ```

3. **Select Events**:
   - Click **Select events**
   - Choose these events:
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
   - Click **Add events**

4. **Copy Webhook Secret**:
   - After creating, click on the webhook
   - Click **Reveal** under "Signing secret"
   - Copy the secret (starts with `whsec_...`)
   - Example: `whsec_1234567890abcdefghijklmnopqrstuvwxyz`
   - Save as: **STRIPE_WEBHOOK_SECRET**

5. **Add to Vercel**:
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Add: `STRIPE_WEBHOOK_SECRET` = `whsec_...`
   - **Redeploy** (important!)

---

## Step 6: Going Live (Production)

When ready to accept real payments:

1. **Switch to Live Mode** in Stripe Dashboard (toggle in top right)

2. **Get Live API Keys**:
   - Developers → API keys
   - Copy **Live** keys (start with `pk_live_...` and `sk_live_...`)

3. **Update Vercel Environment Variables**:
   - Replace test keys with live keys
   - Keep the same webhook secret (it's already live)
   - Redeploy

4. **Verify Live Products**:
   - Your products from test mode won't carry over
   - Recreate Pro ($19) and Enterprise ($99) in live mode
   - Get new live Price IDs
   - Update Pricing.astro with live Price IDs
   - Commit and push

---

## Checklist

Before deploying to Vercel, ensure you have:

- [x] ✅ Created Stripe account
- [ ] Created Pro product ($19/month)
- [ ] Created Enterprise product ($99/month)
- [ ] Copied Pro Price ID
- [ ] Copied Enterprise Price ID
- [ ] Copied Stripe API keys (publishable + secret)
- [ ] Updated Pricing.astro with actual Price IDs
- [ ] Created .env file with Stripe keys
- [ ] Tested locally (optional)
- [ ] Ready to deploy to Vercel

After Vercel deployment:

- [ ] Configure Stripe webhook (Step 5)
- [ ] Add webhook secret to Vercel env vars
- [ ] Redeploy Vercel
- [ ] Test payment flow end-to-end

---

## Testing Payment Flow

### Test Cards (Test Mode Only)

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |
| 4000 0000 0000 9995 | Declined (insufficient funds) |

**Expiry**: Any future date
**CVC**: Any 3 digits
**ZIP**: Any 5 digits

### What to Test

1. **Checkout Flow**:
   - [ ] Click "Start Pro Trial"
   - [ ] Redirects to Stripe Checkout
   - [ ] Shows correct price ($19)
   - [ ] Complete with test card
   - [ ] Redirects to /success page

2. **Webhook & Email**:
   - [ ] Check email for API key
   - [ ] Verify customer in Supabase customers table
   - [ ] Stripe Dashboard shows successful payment

3. **API Access**:
   - [ ] Copy API key from email
   - [ ] Make API request to zodforge-api
   - [ ] Check usage tracking works

---

## Troubleshooting

### "Invalid Price ID" Error

**Cause**: Price ID in Pricing.astro doesn't match Stripe

**Fix**:
1. Go to Stripe → Products → Click on product
2. Copy the exact Price ID (starts with `price_...`)
3. Update Pricing.astro
4. Redeploy

### Webhook Not Receiving Events

**Cause**: Webhook secret mismatch or URL incorrect

**Fix**:
1. Verify webhook URL: `https://YOUR-VERCEL-URL.vercel.app/api/webhook`
2. Check STRIPE_WEBHOOK_SECRET in Vercel matches Stripe
3. Redeploy after changing env vars
4. Check Vercel function logs: Functions → api/webhook

### Email Not Sending

**Cause**: Resend not configured yet

**Fix**: Complete Resend setup (see SETUP.md)

---

## Next Steps

After completing Stripe setup:

1. ✅ **Create Supabase account** (10 min) - see SETUP.md
2. ✅ **Create Resend account** (5 min) - see SETUP.md
3. ✅ **Deploy to Vercel** (10 min) - see VERCEL-DEPLOY.md
4. ✅ **Configure webhook** (Step 5 above)
5. ✅ **Test payment** (Step 6 above)

---

## Support

**Questions?**
- Stripe Docs: https://stripe.com/docs/payments/checkout
- ZodForge Docs: See SETUP.md, VERCEL-DEPLOY.md
- Email: support@zodforge.dev

**Built with** [Claude Code](https://claude.com/claude-code)
