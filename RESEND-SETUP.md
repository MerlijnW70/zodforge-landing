# Resend Setup Guide - ZodForge Cloud

**Time Required**: 5 minutes
**Cost**: Free tier (3,000 emails/month)

This guide walks you through setting up Resend for automated API key delivery emails.

---

## Prerequisites

✅ You have an email address to verify

---

## Step 1: Create Account (2 minutes)

1. **Sign up at Resend**:
   - Visit: https://resend.com/signup
   - Sign up with your email
   - Verify your email address

2. **Complete onboarding**:
   - Select your use case: "Transactional emails"
   - Skip team invitation (can add later)

---

## Step 2: Create API Key (1 minute)

1. **Navigate to API Keys**:
   - In Resend dashboard, click **API Keys** in left sidebar
   - Click **+ Create API Key**

2. **Configure API Key**:
   ```
   Name: ZodForge Cloud Production
   Permission: Full access (default)
   ```
   - Click **Add**

3. **Copy API Key**:
   - The key will be shown ONCE (you can't view it again!)
   - Starts with: `re_...`
   - Example: `re_123abc456def789ghi012jkl345mno678`
   - Save as: **RESEND_API_KEY**

4. **⚠️ Important**:
   - Store securely in `.env` file
   - NEVER commit to Git
   - If lost, create a new key

---

## Step 3: Verify Domain (Optional for Production)

For development/testing, you can skip this and use Resend's default sender.

For production (to avoid "via resend.dev" in emails):

### 3.1 Add Domain

1. Click **Domains** in left sidebar
2. Click **+ Add Domain**
3. Enter your domain: `zodforge.dev`
4. Click **Add**

### 3.2 Add DNS Records

Resend will show you DNS records to add:

```
Type: TXT
Name: _resend
Value: resend_verify_...
```

Add these records in your domain registrar (e.g., Vercel, Cloudflare, Namecheap):

1. Log into your domain provider
2. Go to DNS settings
3. Add the TXT and MX records shown by Resend
4. Wait 5-10 minutes for DNS propagation
5. Click **Verify Records** in Resend

### 3.3 Update Email Sender

Once verified, update the "from" address in `webhook.ts`:

```typescript
// Before (development):
from: 'ZodForge Cloud <noreply@resend.dev>',

// After (production with verified domain):
from: 'ZodForge Cloud <noreply@zodforge.dev>',
```

---

## Step 4: Test Email (Optional - 2 minutes)

Test sending an email from Resend dashboard:

1. Click **Emails** → **Send test email**
2. Configure:
   ```
   From: noreply@resend.dev
   To: your-email@example.com
   Subject: Test from ZodForge Cloud
   Body: This is a test email!
   ```
3. Click **Send**
4. Check your inbox (may take 30-60 seconds)

---

## Step 5: Update Environment Variables (1 minute)

### For zodforge-landing

Edit `.env`:

```env
# Resend Configuration
RESEND_API_KEY=re_YOUR_ACTUAL_API_KEY_HERE
```

### For Vercel (after deployment)

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add: `RESEND_API_KEY` = `re_...`
3. Redeploy

---

## Email Template Preview

This is what customers will receive after payment:

**Subject**: Your ZodForge Cloud API Key - PRO Plan

**From**: ZodForge Cloud <noreply@resend.dev> (or your domain)

**Body**:
```
Welcome to ZodForge Cloud!

Your PRO plan is now active

Your API Key

Here's your ZodForge Cloud API key. Keep it secure and never share it publicly:

zf_abc123def456...

Quick Start

Use your API key to refine schemas:

curl -X POST https://web-production-f15d.up.railway.app/api/v1/refine \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ ... }'

What's Included

• 5,000 requests per month
• OpenAI GPT-4 Turbo + Claude 3.5 Sonnet fallback
• 99.99% uptime SLA
• Priority support

[View Documentation]

Questions? Reply to this email or visit zodforge.dev

© 2025 ZodForge. All rights reserved.
```

---

## Email Features

✅ **Beautiful HTML design** with gradients and styling
✅ **Monospace API key** display for easy copying
✅ **Quick start example** with curl command
✅ **Feature highlights** based on tier
✅ **CTA button** to documentation
✅ **Professional footer** with support info

---

## Monitoring Emails

### View Sent Emails

1. In Resend dashboard, click **Emails**
2. See all sent emails with status:
   - **Delivered** ✅
   - **Bounced** ❌
   - **Complained** (marked as spam)

### Check Delivery Stats

1. Click **Analytics** in left sidebar
2. View:
   - Total emails sent
   - Delivery rate
   - Bounce rate
   - Open rate (if tracking enabled)

---

## Troubleshooting

### Email not received

**Check**:
1. Spam folder
2. Resend dashboard → Emails → Check status
3. Verify RESEND_API_KEY in environment variables
4. Check Vercel function logs for errors

**Common causes**:
- Invalid API key → Check .env file
- Email blocked by recipient's server → Check bounce logs
- Rate limit exceeded (free: 3,000/month) → Upgrade plan

---

### "Invalid API key" error

**Fix**:
1. Go to Resend → API Keys
2. Create a new API key
3. Update RESEND_API_KEY in Vercel environment variables
4. Redeploy

---

### Domain verification failing

**Fix**:
1. Wait 10-15 minutes for DNS propagation
2. Use DNS checker: https://dnschecker.org
3. Verify TXT record shows `resend_verify_...`
4. Click **Verify Records** in Resend again

---

## Rate Limits & Pricing

### Free Tier (Current)

- **3,000 emails per month**
- **100 emails per day**
- Perfect for getting started

### Pro Tier (When needed)

- **$20/month**
- **50,000 emails per month**
- **Custom domains**
- **Priority support**

Upgrade when you exceed free tier.

---

## Best Practices

1. **Monitor delivery rates**:
   - Aim for >95% delivery
   - Investigate bounces
   - Avoid spam complaints

2. **Use verified domain**:
   - More professional
   - Higher deliverability
   - Custom branding

3. **Handle bounces**:
   - Remove invalid emails from list
   - Update customer records

4. **Keep API key secure**:
   - Never commit to Git
   - Rotate periodically (every 6-12 months)
   - Use separate keys for dev/prod

---

## Next Steps

After completing Resend setup:

1. ✅ **Configure Stripe products** - see STRIPE-SETUP.md
2. ✅ **Set up Supabase database** - see SUPABASE-SETUP.md
3. ✅ **Deploy to Vercel** - see VERCEL-DEPLOY.md
4. ✅ **Test payment flow** - end-to-end verification

---

## Support

**Questions?**
- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
- ZodForge Setup: See SETUP.md
- Email: support@zodforge.dev

**Built with** [Claude Code](https://claude.com/claude-code)
