# ZodForge Cloud - Quick Reference Card

**Last Updated**: 2025-10-20
**Status**: Ready for Deployment

---

## ✅ What You Have

### Completed ✓
- [x] Stripe account created
- [x] Supabase account created (`lnmkkpgzjdavkehxeihs`)
- [x] Supabase service_role key obtained
- [x] All code written and tested (0 build errors)
- [x] Complete documentation (13 guides)

### Your Keys (Keep Secure!)
```
Supabase URL: https://lnmkkpgzjdavkehxeihs.supabase.co
Supabase Key: eyJhbGc...Tho (service_role - 200+ chars)
```

---

## 🎯 Remaining Steps (40 minutes)

### Phase 1: Database Setup (3 min)
**Current Step** → **DO THIS NEXT**

1. Go to: https://supabase.com/dashboard/project/lnmkkpgzjdavkehxeihs
2. Click **SQL Editor** → **+ New query**
3. Copy SQL from `SUPABASE-SETUP.md` Step 2.2 (or below)
4. Click **Run**
5. Verify: See `customers` and `usage` tables in **Table Editor**

<details>
<summary>📋 Click to see SQL (copy this)</summary>

```sql
-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create usage table
CREATE TABLE IF NOT EXISTS usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT NOT NULL REFERENCES customers(api_key) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  processing_time_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_customers_api_key ON customers(api_key);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_id ON customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_api_key ON usage(api_key);
CREATE INDEX IF NOT EXISTS idx_usage_created_at ON usage(created_at);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Service role has full access to customers"
  ON customers FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to usage"
  ON usage FOR ALL TO service_role USING (true) WITH CHECK (true);
```
</details>

---

### Phase 2: Stripe Setup (12 min)

**After SQL is done** → Do this

1. Go to: https://dashboard.stripe.com/test/products
2. Click **+ Add product**
3. Create **Pro Plan**:
   - Name: `ZodForge Cloud - Pro`
   - Price: `$19/month` (recurring)
   - **Copy Price ID** (starts with `price_...`)
4. Create **Enterprise Plan**:
   - Name: `ZodForge Cloud - Enterprise`
   - Price: `$99/month` (recurring)
   - **Copy Price ID**
5. Get API keys: https://dashboard.stripe.com/test/apikeys
   - **Copy Publishable key** (pk_test_...)
   - **Copy Secret key** (sk_test_... - click Reveal)

**Update Code**:
```bash
# Edit src/components/Pricing.astro
# Line 35: stripePriceId: 'price_YOUR_PRO_PRICE_ID'
# Line 54: stripePriceId: 'price_YOUR_ENTERPRISE_PRICE_ID'

git add src/components/Pricing.astro
git commit -m "feat: Add Stripe Price IDs"
git push
```

---

### Phase 3: Resend Setup (5 min)

1. Sign up: https://resend.com/signup
2. Verify your email
3. Dashboard → **API Keys** → **+ Create API Key**
4. Name: `ZodForge Cloud`
5. **Copy API key** (starts with `re_...`) - only shown once!

---

### Phase 4: Deploy to Vercel (15 min)

1. Go to: https://vercel.com/new
2. Import `MerlijnW70/zodforge-landing`
3. Add **7 environment variables**:

```env
STRIPE_SECRET_KEY=sk_test_... (from Phase 2)
STRIPE_PUBLISHABLE_KEY=pk_test_... (from Phase 2)
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (same as above)
STRIPE_WEBHOOK_SECRET=whsec_PENDING (update in Phase 5)

SUPABASE_URL=https://lnmkkpgzjdavkehxeihs.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...Tho (you have this!)

RESEND_API_KEY=re_... (from Phase 3)
```

4. Click **Deploy**
5. Wait 2-3 minutes
6. **Copy your Vercel URL**: `https://zodforge-landing-xyz.vercel.app`

---

### Phase 5: Configure Webhook (5 min)

**After Vercel deployment**

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **+ Add endpoint**
3. URL: `https://YOUR-VERCEL-URL.vercel.app/api/webhook`
4. Select events:
   - ✅ checkout.session.completed
   - ✅ customer.subscription.updated
   - ✅ customer.subscription.deleted
5. Click **Add endpoint**
6. Click **Reveal** signing secret
7. **Copy webhook secret** (starts with `whsec_...`)
8. Update in Vercel:
   - Settings → Environment Variables
   - Edit `STRIPE_WEBHOOK_SECRET`
   - Paste webhook secret
   - **Click Redeploy!**

---

### Phase 6: Test Payment (5 min)

1. Visit your Vercel URL
2. Click **"Start Pro Trial"**
3. Enter test card: **4242 4242 4242 4242**
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
4. Complete payment
5. **Check email** (should arrive in ~30 seconds)
6. Copy API key from email
7. Test API:

```bash
curl -X POST https://web-production-f15d.up.railway.app/api/v1/refine \
  -H "Authorization: Bearer YOUR_API_KEY_FROM_EMAIL" \
  -H "Content-Type: application/json" \
  -d '{"schema":{"code":"z.object({email:z.string()})","typeName":"User","fields":{"email":"z.string()"}},"samples":[{"email":"test@example.com"}]}'
```

---

## 🎉 Success Criteria

After Phase 6, you should have:

✅ **Webhook works** - Customer created in Supabase `customers` table
✅ **Email works** - Received email with API key
✅ **API works** - API key successfully calls zodforge-api
✅ **Payment works** - Payment shown in Stripe Dashboard

**If all 4 work → You're live! Ready to accept real payments!** 💰

---

## 🔥 Going Live (Production)

When ready for real money:

1. **Stripe**: Toggle to Live mode → Recreate products → Get live keys
2. **Vercel**: Update env vars with live Stripe keys → Redeploy
3. **Stripe**: Update webhook URL → Copy new webhook secret → Update Vercel
4. **Resend** (optional): Add custom domain for professional emails
5. **Test**: Make a small real payment ($19) → Verify everything works
6. **Launch**: Share on Twitter, Product Hunt, Hacker News! 🚀

---

## 📚 Full Guides

- **START-HERE.md** - Detailed 10-step guide
- **DEPLOYMENT-CHECKLIST.md** - Complete checklist
- **STRIPE-SETUP.md** - Stripe product setup
- **SUPABASE-SETUP.md** - Database setup
- **RESEND-SETUP.md** - Email setup
- **PROJECT-STATUS.md** - Current status

---

## 🆘 Common Issues

### "Missing environment variable"
→ Check all 7 env vars in Vercel are correct
→ Redeploy after changing env vars

### "Webhook signature verification failed"
→ STRIPE_WEBHOOK_SECRET doesn't match
→ Get new secret from Stripe webhook settings
→ Update in Vercel → Redeploy

### "Email not received"
→ Check spam folder
→ Verify RESEND_API_KEY in Vercel
→ Check Resend dashboard for delivery

### "Database permission denied"
→ Using anon key instead of service_role
→ Verify SUPABASE_SERVICE_KEY is service_role (200+ chars)

---

## 📞 Support

- **Guides**: Check the 13 documentation files
- **GitHub**: https://github.com/MerlijnW70/zodforge-landing/issues
- **Email**: support@zodforge.dev

---

## ⏱️ Time Breakdown

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Database setup | 3 min | ⏳ Next |
| 2 | Stripe products | 12 min | ⏳ Waiting |
| 3 | Resend account | 5 min | ⏳ Waiting |
| 4 | Vercel deploy | 15 min | ⏳ Waiting |
| 5 | Stripe webhook | 5 min | ⏳ Waiting |
| 6 | Test payment | 5 min | ⏳ Waiting |
| **Total** | **End to end** | **45 min** | **11% done** |

---

## 🎯 Your Next Action

**Open Supabase SQL Editor and run the SQL from Phase 1 above!**

Once done, let me know and I'll guide you through Phase 2! 🚀

---

**Built with** [Claude Code](https://claude.com/claude-code)
