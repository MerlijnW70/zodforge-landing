# 🚀 Your Next Steps - ZodForge Cloud

**Current Status**: ✅ Code ready, Stripe + Supabase accounts created
**Time Remaining**: 45 minutes to deploy
**Goal**: Start accepting payments today!

---

## ⚡ Quick Start (Do These Now)

### Step 1: Get Supabase Service Key (2 minutes)

**⚠️ IMPORTANT**: You gave me the `anon` key, but we need the `service_role` key!

1. Go to: https://supabase.com/dashboard/project/lnmkkpgzjdavkehxeihs/settings/api
2. Scroll to **"Project API keys"** section
3. Find the **`service_role`** key (NOT `anon`!)
4. Click **"Reveal"**
5. Copy the entire key (very long, starts with `eyJhbGc...`)

**Why?** The service_role key has full database access (needed for webhooks to insert customers).

---

### Step 2: Run Supabase SQL Schema (3 minutes)

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **+ New query**
3. Open `SUPABASE-SETUP.md` → Copy the SQL from Step 2.2
4. Paste into SQL Editor
5. Click **Run**
6. Verify: Click **Table Editor**, you should see `customers` and `usage` tables

---

### Step 3: Create Stripe Products (10 minutes)

1. Go to: https://dashboard.stripe.com/products
2. Click **+ Add product**
3. Create **Pro plan**:
   - Name: `ZodForge Cloud - Pro`
   - Price: `$19/month`
   - Click **Add price**
   - **Copy the Price ID** (starts with `price_...`)
4. Create **Enterprise plan**:
   - Name: `ZodForge Cloud - Enterprise`
   - Price: `$99/month`
   - Click **Add price**
   - **Copy the Price ID** (starts with `price_...`)

---

### Step 4: Update Pricing.astro (2 minutes)

1. Edit: `zodforge-landing/src/components/Pricing.astro`
2. Find line 35: `stripePriceId: 'price_PLACEHOLDER',`
   - Replace with your Pro Price ID from Step 3
3. Find line 54: `stripePriceId: 'price_PLACEHOLDER',`
   - Replace with your Enterprise Price ID from Step 3
4. Save file
5. Commit and push:
   ```bash
   cd zodforge-landing
   git add src/components/Pricing.astro
   git commit -m "feat: Add Stripe Price IDs for Pro and Enterprise"
   git push origin main
   ```

---

### Step 5: Get Stripe API Keys (2 minutes)

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** (starts with `pk_test_...`)
3. Click **Reveal test key** for Secret key (starts with `sk_test_...`)
4. Save both keys (you'll add to Vercel in Step 6)

---

### Step 6: Create Resend Account (5 minutes)

1. Sign up: https://resend.com/signup
2. Verify your email
3. Go to: Dashboard → API Keys
4. Click **+ Create API Key**
   - Name: `ZodForge Cloud Production`
   - Permission: Full access
5. Click **Add**
6. **Copy the API key** (starts with `re_...`) - you can only see this once!

---

### Step 7: Deploy to Vercel (15 minutes)

**See `DEPLOYMENT-CHECKLIST.md` Phase 2** for detailed steps, but here's the quick version:

1. Go to: https://vercel.com/new
2. Import: `MerlijnW70/zodforge-landing`
3. Add 7 environment variables:
   ```
   STRIPE_SECRET_KEY=sk_test_... (from Step 5)
   STRIPE_PUBLISHABLE_KEY=pk_test_... (from Step 5)
   PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (same as above)
   STRIPE_WEBHOOK_SECRET=whsec_PENDING (update in Step 8)
   SUPABASE_URL=https://lnmkkpgzjdavkehxeihs.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGc... (from Step 1)
   RESEND_API_KEY=re_... (from Step 6)
   ```
4. Click **Deploy**
5. Wait 2-3 minutes
6. Copy your Vercel URL (e.g., `https://zodforge-landing-xyz.vercel.app`)

---

### Step 8: Configure Stripe Webhook (5 minutes)

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **+ Add endpoint**
3. Endpoint URL: `https://YOUR-VERCEL-URL.vercel.app/api/webhook` (from Step 7)
4. Select events:
   - ✅ checkout.session.completed
   - ✅ customer.subscription.updated
   - ✅ customer.subscription.deleted
5. Click **Add endpoint**
6. Click **Reveal** under "Signing secret"
7. Copy webhook secret (starts with `whsec_...`)
8. **Update Vercel**:
   - Go to Vercel → Settings → Environment Variables
   - Edit `STRIPE_WEBHOOK_SECRET`
   - Paste webhook secret
   - Click **Redeploy** (important!)

---

### Step 9: Update Railway API (2 minutes)

1. Go to: Railway → zodforge-api project → Variables
2. Add:
   ```
   SUPABASE_URL=https://lnmkkpgzjdavkehxeihs.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGc... (from Step 1)
   ```
3. Click **Save**
4. Wait ~2 minutes for auto-redeploy

---

### Step 10: Test Everything! (5 minutes)

1. Visit your Vercel URL
2. Click **"Start Pro Trial"**
3. Enter test card: `4242 4242 4242 4242`
4. Complete payment
5. Check email for API key
6. Test API:
   ```bash
   curl -X POST https://web-production-f15d.up.railway.app/api/v1/refine \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"schema":{"code":"z.object({email:z.string()})","typeName":"User","fields":{"email":"z.string()"}},"samples":[{"email":"test@example.com"}]}'
   ```

---

## ✅ Success!

If the test works, you now have:
- ✅ Working payment system
- ✅ Automated API key delivery
- ✅ Usage tracking
- ✅ Ready to accept real payments!

---

## 📚 Need Help?

**Detailed guides**:
- `DEPLOYMENT-CHECKLIST.md` - Complete deployment guide
- `SUPABASE-SETUP.md` - Database configuration
- `STRIPE-SETUP.md` - Payment setup
- `RESEND-SETUP.md` - Email setup
- `SUPABASE-SERVICE-KEY.md` - Finding service_role key

**Stuck?** Open an issue on GitHub or check the troubleshooting sections in the guides.

---

## 🎯 Your Mission

Complete Steps 1-10 above (45 minutes total), then you can start accepting payments!

**Let's go! 🚀**

---

**Built with** [Claude Code](https://claude.com/claude-code)
