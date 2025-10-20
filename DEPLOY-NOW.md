# 🚀 DEPLOY NOW - Ready for Vercel!

**Status**: ✅ 100% Ready - All configuration complete!

**Time to deploy**: 10 minutes

---

## 📦 What's Ready

✅ Code pushed to GitHub (`MerlijnW70/zodforge-landing`)
✅ All Stripe Price IDs configured
✅ All API keys collected
✅ Supabase database created
✅ Resend account created
✅ Build errors fixed (0 errors, 0 warnings)

**You're ready to deploy!**

---

## 🎯 Step 1: Import to Vercel (3 minutes)

1. Go to: **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select: **`MerlijnW70/zodforge-landing`**
4. Framework preset: **Astro** (auto-detected)
5. **DON'T click Deploy yet!** First add environment variables below ⬇️

---

## 🔑 Step 2: Add Environment Variables (5 minutes)

In Vercel's "Configure Project" section, click **"Environment Variables"**.

**📋 Copy values from**: Open the local file `VERCEL-ENV-VARS.txt` in your zodforge-landing folder.

Add these **7 variables** with the values from the file:

### Variable 1: STRIPE_SECRET_KEY
Get value from `VERCEL-ENV-VARS.txt` (starts with `sk_test_...`)

### Variable 2: STRIPE_PUBLISHABLE_KEY
Get value from `VERCEL-ENV-VARS.txt` (starts with `pk_test_...`)

### Variable 3: PUBLIC_STRIPE_PUBLISHABLE_KEY
**Same value as Variable 2** (starts with `pk_test_...`)

### Variable 4: STRIPE_WEBHOOK_SECRET
```
whsec_PENDING
```
⚠️ **Important**: We'll update this AFTER deployment (Step 4)

### Variable 5: SUPABASE_URL
```
https://lnmkkpgzjdavkehxeihs.supabase.co
```

### Variable 6: SUPABASE_SERVICE_KEY
Get value from `VERCEL-ENV-VARS.txt` (starts with `eyJhbGc...`, very long)

### Variable 7: RESEND_API_KEY
Get value from `VERCEL-ENV-VARS.txt` (starts with `re_...`)

💡 **Tip**: Open `VERCEL-ENV-VARS.txt` in a text editor and copy-paste each value directly to Vercel.

---

## ✅ Checklist Before Deploying

- [ ] All 7 environment variables added
- [ ] Each variable name is **exactly** as shown (case-sensitive!)
- [ ] No extra spaces in values
- [ ] STRIPE_WEBHOOK_SECRET set to `whsec_PENDING` (we'll update it later)

**Click "Deploy" button** 🚀

---

## ⏱️ Step 3: Wait for Deployment (2-3 minutes)

Vercel will:
1. Clone your repository
2. Install dependencies
3. Build your Astro site
4. Deploy to their edge network

**Expected result**: `✅ Deployment successful!`

**Copy your Vercel URL**: `https://zodforge-landing-XXXXX.vercel.app`

---

## 🔗 Step 4: Configure Stripe Webhook (3 minutes)

Now that you have a Vercel URL, let's connect Stripe:

### 4.1 Create Webhook Endpoint

1. Go to: **https://dashboard.stripe.com/test/webhooks**
2. Click **"+ Add endpoint"** (top right)
3. Endpoint URL: `https://YOUR-VERCEL-URL.vercel.app/api/webhook`
   - Replace `YOUR-VERCEL-URL` with your actual Vercel URL
   - Example: `https://zodforge-landing-abc123.vercel.app/api/webhook`
4. Description: `ZodForge Cloud payment webhook`
5. Click **"Select events"**
6. Search and select these **3 events**:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
7. Click **"Add events"**
8. Click **"Add endpoint"**

### 4.2 Get Webhook Secret

1. On the webhook page, find **"Signing secret"** section
2. Click **"Reveal"** (or "Click to reveal secret")
3. **Copy the entire secret** (starts with `whsec_...`)
4. It will look like: `whsec_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890...`

### 4.3 Update Vercel Environment Variable

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Find **`STRIPE_WEBHOOK_SECRET`**
3. Click the **"⋯"** menu → **"Edit"**
4. Replace `whsec_PENDING` with your actual webhook secret
5. Click **"Save"**
6. **IMPORTANT**: Click **"Redeploy"** to apply the change
   - Vercel → Deployments → Latest → Three dots → Redeploy

---

## 🧪 Step 5: Test Payment Flow (5 minutes)

### 5.1 Visit Your Site
Open your Vercel URL: `https://YOUR-VERCEL-URL.vercel.app`

### 5.2 Test Pro Checkout
1. Scroll to **Pricing** section
2. Click **"Start Pro Trial"** button
3. Verify redirect to Stripe Checkout
4. You should see:
   - ✅ Product: ZodForge Cloud - Pro
   - ✅ Price: $19.00 / month
   - ✅ Test mode banner (top of page)

### 5.3 Complete Test Payment
Use these **test card details**:

```
Card number: 4242 4242 4242 4242
Expiry: 12/25 (any future date)
CVC: 123 (any 3 digits)
ZIP: 12345 (any 5 digits)
Name: Test User
Email: YOUR_REAL_EMAIL@example.com (use real email to receive API key!)
```

### 5.4 Verify Success
After payment:
1. ✅ Redirect to `/success` page
2. ✅ Check your email (within 1-2 minutes)
   - Subject: "Your ZodForge Cloud API Key - PRO Plan"
   - Contains API key starting with `zf_...`
3. ✅ Check Supabase:
   - Go to: https://supabase.com/dashboard/project/lnmkkpgzjdavkehxeihs
   - Click **Table Editor** → **customers**
   - See 1 row with your email
4. ✅ Check Stripe:
   - Go to: https://dashboard.stripe.com/test/payments
   - See successful $19.00 payment

### 5.5 Test API Access
Copy the API key from your email, then test:

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

**Expected response**: `{ "success": true, "schema": { ... } }`

---

## 🎉 Success!

If all 5 tests passed, **you're live!** 🚀

**You now have**:
- ✅ Live landing page accepting payments
- ✅ Automated API key delivery via email
- ✅ Usage tracking and rate limiting
- ✅ Complete payment automation

---

## 🔄 Next Steps (Optional)

### Switch to Production Mode (when ready)
1. Stripe: Toggle to **Live mode**
2. Create live products ($19 Pro, $99 Enterprise)
3. Get new live API keys (`pk_live_...` and `sk_live_...`)
4. Update all Stripe env vars in Vercel
5. Update webhook with live endpoint
6. Test with real card (charge yourself $19 to verify)
7. **Go live!** 🎊

### Custom Domain (optional)
1. Buy domain (e.g., `zodforge.dev`)
2. Vercel → Settings → Domains → Add
3. Update DNS records
4. Update Stripe webhook URL to custom domain

---

## 🆘 Troubleshooting

### Webhook not working
- Verify webhook URL matches Vercel URL exactly
- Check Stripe Dashboard → Webhooks → Delivery attempts
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Redeploy after updating webhook secret

### Email not received
- Check spam folder
- Verify `RESEND_API_KEY` in Vercel
- Check Resend dashboard for delivery

### Database errors
- Verify `SUPABASE_SERVICE_KEY` is service_role (not anon!)
- Check Supabase Table Editor for tables

---

## 📞 Support

- **Guides**: Check DEPLOYMENT-CHECKLIST.md for detailed troubleshooting
- **GitHub**: https://github.com/MerlijnW70/zodforge-landing/issues

---

**Built with** [Claude Code](https://claude.com/claude-code)

**Time to build**: 8 hours
**Time to deploy**: 10 minutes
**Time to revenue**: Now! 💰
