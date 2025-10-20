# ZodForge Cloud - Deployment Checklist

**Time to Deploy**: 45-60 minutes
**Time to First Revenue**: < 24 hours after deployment

This is your complete checklist to go from code to production.

---

## ✅ Completed

- [x] Created Stripe account
- [x] Created Supabase account (`https://lnmkkpgzjdavkehxeihs.supabase.co`)
- [x] Fixed all Vercel build errors
- [x] Stripe Checkout integration complete
- [x] Database schema ready
- [x] Email template ready

---

## 🎯 Next Steps (in order)

### Phase 1: Configure Services (30 minutes)

#### 1.1 Supabase Configuration (10 min) - **DO THIS FIRST**

- [ ] **Get service_role key** (NOT anon key!)
  - Go to: https://supabase.com/dashboard/project/lnmkkpgzjdavkehxeihs/settings/api
  - Find "Project API keys" section
  - Click "Reveal" next to **`service_role`** (secret)
  - Copy the long key (starts with `eyJhbGc...`)
  - See: `SUPABASE-SERVICE-KEY.md` for detailed help

- [ ] **Run SQL schema**
  - In Supabase, click **SQL Editor**
  - Click **+ New query**
  - Copy SQL from `SUPABASE-SETUP.md` (Step 2.2)
  - Click **Run**
  - Verify: Click **Table Editor**, see `customers` and `usage` tables

---

#### 1.2 Stripe Configuration (15 min)

- [ ] **Create Products**
  - Follow `STRIPE-SETUP.md` Step 1
  - Create **Pro** product: $19/month
  - Create **Enterprise** product: $99/month
  - Copy both **Price IDs** (start with `price_...`)

- [ ] **Update Pricing.astro**
  - Edit: `src/components/Pricing.astro`
  - Line 35: Replace `price_PLACEHOLDER` with Pro price ID
  - Line 54: Replace `price_PLACEHOLDER` with Enterprise price ID
  - Commit and push

- [ ] **Get API Keys**
  - Go to: Stripe Dashboard → Developers → API keys
  - Copy **Publishable key** (starts with `pk_test_...`)
  - Copy **Secret key** (click Reveal, starts with `sk_test_...`)

---

#### 1.3 Resend Configuration (5 min)

- [ ] **Create account**
  - Sign up: https://resend.com/signup
  - Verify your email

- [ ] **Create API key**
  - Dashboard → API Keys → + Create API Key
  - Name: "ZodForge Cloud Production"
  - Copy key (starts with `re_...`)
  - See: `RESEND-SETUP.md` for detailed help

---

### Phase 2: Deploy to Vercel (15 minutes)

#### 2.1 Import Repository

- [ ] Go to: https://vercel.com/new
- [ ] Click "Import Git Repository"
- [ ] Select: `MerlijnW70/zodforge-landing`
- [ ] Framework: **Astro** (auto-detected)
- [ ] Click **Import**

---

#### 2.2 Add Environment Variables

In Vercel project settings, add these 7 variables:

```env
# Stripe (from Phase 1.2)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY  # Same as above
STRIPE_WEBHOOK_SECRET=whsec_PENDING  # Will update in Step 2.4

# Supabase (from Phase 1.1)
SUPABASE_URL=https://lnmkkpgzjdavkehxeihs.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...YOUR_SERVICE_ROLE_KEY

# Resend (from Phase 1.3)
RESEND_API_KEY=re_YOUR_API_KEY
```

**⚠️ Important**:
- Click "Add" after each variable
- Double-check all values before deploying

---

#### 2.3 Deploy

- [ ] Click **Deploy**
- [ ] Wait 2-3 minutes for build to complete
- [ ] Copy your Vercel URL: `https://zodforge-landing-xyz.vercel.app`
- [ ] Visit URL and verify landing page loads

---

#### 2.4 Configure Stripe Webhook

- [ ] Go to: Stripe Dashboard → Developers → Webhooks
- [ ] Click **+ Add endpoint**
- [ ] Endpoint URL: `https://YOUR-VERCEL-URL.vercel.app/api/webhook`
- [ ] Select events:
  - [x] `checkout.session.completed`
  - [x] `customer.subscription.updated`
  - [x] `customer.subscription.deleted`
- [ ] Click **Add endpoint**
- [ ] Click on webhook → Click "Reveal" under Signing secret
- [ ] Copy webhook secret (starts with `whsec_...`)
- [ ] **Update Vercel env var**:
  - Vercel → Settings → Environment Variables
  - Edit `STRIPE_WEBHOOK_SECRET`
  - Paste webhook secret
  - **Important**: Click "Redeploy" after updating!

---

### Phase 3: Update API (5 minutes)

#### 3.1 Add Supabase to Railway

- [ ] Go to: Railway → zodforge-api project → Variables
- [ ] Add variable: `SUPABASE_URL` = `https://lnmkkpgzjdavkehxeihs.supabase.co`
- [ ] Add variable: `SUPABASE_SERVICE_KEY` = `eyJhbGc...` (your service_role key)
- [ ] Click **Save**
- [ ] Railway auto-redeploys (wait ~2 minutes)
- [ ] Verify: https://web-production-f15d.up.railway.app/api/v1/health

---

### Phase 4: Test End-to-End (10 minutes)

#### 4.1 Test Checkout Flow

- [ ] Visit your Vercel URL
- [ ] Click **"Start Pro Trial"**
- [ ] Verify redirect to Stripe Checkout
- [ ] Verify shows "$19.00 / month"
- [ ] Enter test card: `4242 4242 4242 4242`
  - Expiry: Any future date
  - CVC: Any 3 digits
  - ZIP: Any 5 digits
- [ ] Complete payment
- [ ] Verify redirect to `/success` page

---

#### 4.2 Verify Automation

- [ ] **Check Email** (within 1 minute)
  - Should receive email with subject: "Your ZodForge Cloud API Key - PRO Plan"
  - Email contains API key starting with `zf_...`
  - Copy the API key

- [ ] **Check Supabase** (in browser)
  - Go to: Table Editor → `customers` table
  - Should see 1 row with your email
  - Verify tier = 'pro'
  - Verify subscription_status = 'active'

- [ ] **Check Stripe** (in browser)
  - Go to: Stripe Dashboard → Payments
  - Should see successful payment for $19.00

---

#### 4.3 Test API Access

Use the API key from email:

```bash
curl -X POST https://web-production-f15d.up.railway.app/api/v1/refine \
  -H "Authorization: Bearer YOUR_API_KEY_FROM_EMAIL" \
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

Expected response:
```json
{
  "success": true,
  "schema": {
    "code": "z.object({ email: z.string().email() })",
    ...
  }
}
```

---

#### 4.4 Test Usage Tracking

```bash
curl https://web-production-f15d.up.railway.app/api/v1/usage \
  -H "Authorization: Bearer YOUR_API_KEY_FROM_EMAIL"
```

Expected response:
```json
{
  "tier": "pro",
  "currentPeriod": {
    "used": 1,
    "limit": 5000,
    "remaining": 4999,
    "resetDate": "2025-11-20T00:00:00Z",
    "percentUsed": 0
  },
  "lastWeek": {
    "totalRequests": 1,
    "successRate": 100,
    "failedRequests": 0,
    "avgProcessingTimeMs": 1842
  }
}
```

---

## 🎉 Success Criteria

If all tests pass, you have:

✅ **Working payment system**
  - Customer can purchase Pro/Enterprise subscriptions
  - Stripe processes payments successfully

✅ **Automated onboarding**
  - Webhook receives payment confirmation
  - API key generated and stored in database
  - Email sent with API key

✅ **Functional API**
  - Customers can make API requests
  - Usage tracked in database
  - Tier-based rate limiting active

✅ **Complete monitoring**
  - Can view customers in Supabase
  - Can view payments in Stripe
  - Can view emails in Resend
  - Can check API logs in Railway

---

## 🚀 Going Live (Production)

When ready to accept real payments:

### 1. Switch Stripe to Live Mode

- [ ] Stripe Dashboard → Toggle "Test mode" to OFF (top right)
- [ ] Recreate Pro and Enterprise products in live mode
- [ ] Get new live Price IDs
- [ ] Update Pricing.astro with live Price IDs
- [ ] Get live API keys (pk_live_... and sk_live_...)
- [ ] Update Vercel env vars with live keys
- [ ] Update webhook with live endpoint
- [ ] Redeploy Vercel

### 2. Optional: Custom Domain

- [ ] Buy domain (e.g., zodforge.dev)
- [ ] Add to Vercel: Settings → Domains
- [ ] Update DNS records
- [ ] Enable HTTPS (automatic)
- [ ] Update Stripe webhook URL to custom domain

### 3. Optional: Verify Resend Domain

- [ ] Add domain to Resend
- [ ] Add DNS records (TXT, MX)
- [ ] Update webhook.ts from address: `noreply@zodforge.dev`
- [ ] Redeploy

---

## 📊 Post-Launch Monitoring

Daily checks:

- [ ] Check Stripe Dashboard for new payments
- [ ] Check Supabase for new customers
- [ ] Check Resend for email delivery rates
- [ ] Check Railway logs for API errors
- [ ] Monitor usage patterns

Weekly checks:

- [ ] Review revenue (Stripe Dashboard)
- [ ] Check customer churn (Supabase queries)
- [ ] Analyze usage patterns (usage table)
- [ ] Review error rates (Railway logs)

---

## 🆘 Troubleshooting

### Webhook not working

1. Check Stripe Dashboard → Webhooks → Delivery attempts
2. Verify webhook URL matches Vercel URL
3. Verify STRIPE_WEBHOOK_SECRET in Vercel env vars
4. Check Vercel function logs: Functions → api/webhook

### Email not sending

1. Verify RESEND_API_KEY in Vercel
2. Check Resend dashboard for delivery attempts
3. Check spam folder
4. View Vercel function logs

### Database errors

1. Verify SUPABASE_SERVICE_KEY is service_role (not anon!)
2. Check tables exist in Supabase Table Editor
3. Verify RLS policies allow service_role access
4. Check Supabase logs

### API not working

1. Verify API key starts with `zf_`
2. Check customer exists in Supabase customers table
3. Verify subscription_status = 'active'
4. Check Railway logs for errors

---

## 📚 Documentation Reference

- **STRIPE-SETUP.md** - Stripe product configuration
- **SUPABASE-SETUP.md** - Database setup and SQL schema
- **SUPABASE-SERVICE-KEY.md** - How to find service_role key
- **RESEND-SETUP.md** - Email service configuration
- **VERCEL-DEPLOY.md** - Vercel deployment guide
- **COMPLETE-SYSTEM-GUIDE.md** - System architecture overview

---

## 🎯 Current Status

**Completed**:
- [x] Code ready (all build errors fixed)
- [x] Stripe account created
- [x] Supabase account created

**Pending** (45 minutes remaining):
- [ ] Get Supabase service_role key (2 min)
- [ ] Run Supabase SQL schema (3 min)
- [ ] Create Stripe products (10 min)
- [ ] Update Pricing.astro (2 min)
- [ ] Create Resend account (5 min)
- [ ] Deploy to Vercel (10 min)
- [ ] Configure Stripe webhook (3 min)
- [ ] Test end-to-end (10 min)

**After deployment**:
- Time to first revenue: < 24 hours! 💰

---

**Built with** [Claude Code](https://claude.com/claude-code)
