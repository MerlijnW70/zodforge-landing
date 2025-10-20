# Vercel Deployment Guide

**Estimated Time**: 10 minutes
**Repository**: https://github.com/MerlijnW70/zodforge-landing

---

## ✅ Pre-Deployment Checklist

Before deploying to Vercel, ensure you have:

- [x] ✅ **GitHub repository created** - https://github.com/MerlijnW70/zodforge-landing
- [x] ✅ **Code pushed to GitHub** - All files committed and pushed
- [ ] 🔑 **Stripe account** - API keys ready (or use test keys)
- [ ] 🔑 **Supabase account** - Database created and API keys ready
- [ ] 🔑 **Resend account** - Email API key ready
- [ ] 💳 **Vercel account** - Sign up at https://vercel.com

---

## 🚀 Deploy to Vercel (Step-by-Step)

### Step 1: Import Project

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select **GitHub** and authorize Vercel
4. Choose **MerlijnW70/zodforge-landing**
5. Click **Import**

### Step 2: Configure Project

Vercel will auto-detect Astro. Verify these settings:

- **Framework Preset**: Astro ✅ (auto-detected)
- **Root Directory**: `./` (leave default)
- **Build Command**: `npm run build` ✅ (auto-detected)
- **Output Directory**: `dist` ✅ (auto-detected)
- **Install Command**: `npm install` ✅ (auto-detected)

### Step 3: Add Environment Variables

Click **Environment Variables** and add these:

#### Required for Testing (Stripe Test Mode):

```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

#### Required for Database & Email:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=re_YOUR_API_KEY_HERE
```

**Note**: You can use placeholder values for initial deployment and update them later.

### Step 4: Deploy!

1. Click **Deploy** button
2. Wait ~2-3 minutes for build to complete
3. You'll get a URL like: `https://zodforge-landing-xyz.vercel.app`

---

## 🔧 Post-Deployment Steps

### 1. Configure Stripe Webhook

Once deployed, you need to tell Stripe where to send payment events:

1. Go to Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. **Endpoint URL**: `https://YOUR_VERCEL_URL.vercel.app/api/webhook`
   - Example: `https://zodforge-landing-xyz.vercel.app/api/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Go to Vercel → Project Settings → Environment Variables
8. Update `STRIPE_WEBHOOK_SECRET` with the new secret
9. Redeploy: Go to Deployments → Click **Redeploy** (⋯ menu)

### 2. Update Stripe Price IDs

Get your Price IDs from Stripe Dashboard → Products:

1. Copy Pro plan Price ID (starts with `price_`)
2. Copy Enterprise plan Price ID
3. Edit `src/components/Pricing.astro` on GitHub:
   - Update `stripePriceId` for Pro tier
   - Update `stripePriceId` for Enterprise tier
4. Commit and push (Vercel auto-deploys on push)

---

## 🧪 Test the Deployment

### Test 1: Landing Page

Visit your Vercel URL and verify:
- ✅ Landing page loads correctly
- ✅ Hero section displays
- ✅ Pricing section shows 3 tiers
- ✅ No console errors

### Test 2: Stripe Checkout (Test Mode)

1. Click "Start Pro Trial"
2. Should redirect to Stripe Checkout
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Should redirect to `/success` page

### Test 3: Webhook & Email

After successful test payment:
1. Check email inbox for API key email
2. Check Supabase → Table Editor → `customers` table
3. Should see new customer record
4. Verify Stripe Dashboard → Webhooks shows successful delivery

---

## 🎉 Success Indicators

Your deployment is successful when:

- ✅ Landing page accessible at Vercel URL
- ✅ No build errors in Vercel dashboard
- ✅ Test checkout redirects to Stripe
- ✅ Webhook receives payment events (check Vercel logs)
- ✅ Email delivered with API key
- ✅ Customer record created in Supabase

---

## 🐛 Troubleshooting

### Build Fails

**Error**: `Module not found` or `Cannot find package`

**Fix**:
1. Check `package.json` dependencies are correct
2. Verify `astro.config.mjs` exists
3. Check Vercel build logs for specific error

### Environment Variables Not Working

**Error**: `undefined` or `null` values in logs

**Fix**:
1. Verify all env vars are added in Vercel
2. Check spelling (case-sensitive!)
3. Redeploy after adding/updating env vars

### Webhook Not Receiving Events

**Error**: Stripe shows "Failed" delivery attempts

**Fix**:
1. Verify webhook URL is correct (ends with `/api/webhook`)
2. Check `STRIPE_WEBHOOK_SECRET` matches Stripe
3. View Vercel function logs: Functions → `api/webhook`
4. Ensure webhook endpoint is deployed (not 404)

### Email Not Sending

**Error**: No email received after payment

**Fix**:
1. Check `RESEND_API_KEY` is correct
2. View Vercel function logs for errors
3. Check Resend dashboard for delivery attempts
4. Verify email address is valid

---

## 📊 Vercel Dashboard URLs

After deployment, bookmark these:

- **Project Overview**: https://vercel.com/merlijnw70/zodforge-landing
- **Deployments**: https://vercel.com/merlijnw70/zodforge-landing/deployments
- **Analytics**: https://vercel.com/merlijnw70/zodforge-landing/analytics
- **Function Logs**: https://vercel.com/merlijnw70/zodforge-landing/logs
- **Environment Variables**: https://vercel.com/merlijnw70/zodforge-landing/settings/environment-variables

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. Make changes locally
2. Commit: `git commit -m "feat: Update pricing"`
3. Push: `git push origin main`
4. Vercel auto-deploys (takes ~2-3 minutes)
5. Check deployment status in Vercel dashboard

---

## 💰 Ready for Production?

### Switch from Test to Live Mode:

1. **Stripe**: Switch to live mode in dashboard
   - Get live API keys (starts with `sk_live_` and `pk_live_`)
   - Update Vercel env vars
2. **Resend**: Verify domain (for production emails)
3. **Supabase**: Already in production mode
4. **Redeploy**: Vercel → Deployments → Redeploy

### Enable Production Features:

- [ ] Add custom domain in Vercel (e.g., `zodforge.dev`)
- [ ] Enable analytics
- [ ] Set up monitoring/alerts
- [ ] Add production webhook endpoint in Stripe (with live keys)

---

## 📚 Next Steps

After successful deployment:

1. ✅ Test complete payment flow with real credit card (in test mode)
2. ✅ Verify email delivery and API key format
3. ✅ Check database records in Supabase
4. ✅ Share your landing page URL!
5. ✅ (Optional) Add custom domain
6. ✅ (Optional) Implement usage tracking (see SETUP.md)

---

## 🤝 Support

**Need Help?**

- Vercel Docs: https://vercel.com/docs
- Astro Docs: https://docs.astro.build
- Stripe Docs: https://stripe.com/docs
- Check SETUP.md for detailed troubleshooting
- GitHub Issues: https://github.com/MerlijnW70/zodforge-landing/issues

---

**Built with** [Claude Code](https://claude.com/claude-code)
**Deployment**: Vercel Edge Functions
**Repository**: https://github.com/MerlijnW70/zodforge-landing
