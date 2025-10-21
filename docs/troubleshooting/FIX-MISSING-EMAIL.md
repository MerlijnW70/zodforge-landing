# 🚨 Fix Missing Email for facturen@multimediagroup.nl

## Problem
Customer paid via Stripe, record exists in Supabase, but **email with API key was NOT sent**.

## Root Cause (Most Likely)
**RESEND_API_KEY is missing in Vercel environment variables** → Webhook processed payment successfully, but email failed to send.

---

## ✅ **Quick Fix (Option 1: Manually Resend Email)** - 2 minutes

### Step 1: Run Manual Resend Script

```bash
# Navigate to landing directory
cd zodforge-landing

# Run the manual resend script
npx tsx resend-email-manual.ts facturen@multimediagroup.nl
```

**What this does:**
1. ✅ Looks up customer in Supabase
2. ✅ Generates a NEW API key (old one is invalidated)
3. ✅ Updates database with new key hash
4. ✅ Sends email with the new API key

**Expected output:**
```
🔍 Looking up customer: facturen@multimediagroup.nl...
✅ Customer found: { email, tier, subscription_status }
📝 Generating NEW API key...
🔑 New API key generated
✅ Database updated
📧 Sending email...
✅ Email sent successfully!

📋 Summary:
   Customer: facturen@multimediagroup.nl
   Tier: PRO
   API Key: zf_abc123...

🎉 Done! Customer should receive email within 1-2 minutes.
```

---

## 🔧 **Long-Term Fix (Option 2: Fix Vercel Config)** - 5 minutes

This prevents the issue from happening again.

### Step 1: Add RESEND_API_KEY to Vercel

1. **Go to Vercel Dashboard**:
   - URL: https://vercel.com
   - Select project: **zodforge-landing**

2. **Navigate to Environment Variables**:
   - Settings → Environment Variables

3. **Add RESEND_API_KEY**:
   ```
   Name: RESEND_API_KEY
   Value: re_YOUR_API_KEY_FROM_RESEND_DASHBOARD
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```

4. **Click "Save"**

### Step 2: Redeploy Site

```bash
# Option A: Trigger redeploy via Vercel dashboard
# Settings → Deployments → ... → Redeploy

# Option B: Push a commit to trigger auto-deploy
cd zodforge-landing
git commit --allow-empty -m "chore: Trigger redeploy to update env vars"
git push
```

### Step 3: Test Webhook

1. **Make a test payment** (use Stripe test card)
2. **Check email arrives** within 1-2 minutes
3. **Verify email in Resend dashboard**: https://resend.com/emails

---

## 🔍 **Diagnostic Steps (If Problem Persists)**

### 1. Check Vercel Logs

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Link project
cd zodforge-landing
vercel link

# View recent logs
vercel logs --limit 100
```

**Look for errors like:**
- ❌ `RESEND_API_KEY is not defined`
- ❌ `Failed to send email`
- ❌ `Invalid API key`

### 2. Check Stripe Webhook Logs

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click your webhook endpoint
3. Find the `checkout.session.completed` event for `facturen@multimediagroup.nl`
4. Check **Response** tab for errors

### 3. Check Resend Dashboard

1. Go to: https://resend.com/emails
2. Look for email to `facturen@multimediagroup.nl`
3. Status should be:
   - ✅ **Delivered** (success)
   - ❌ **Bounced** (recipient rejected)
   - ⏳ **Pending** (still sending)

### 4. Check Spam Folder

Sometimes emails land in spam. Ask customer to check:
- Spam/Junk folder
- Search for: "ZodForge Cloud" or "noreply@zodforge.dev"

---

## 🧪 **Test Email Sending (Optional)**

### Test Resend API Key

```bash
# Test that Resend API key works
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_YOUR_API_KEY_FROM_RESEND_DASHBOARD' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "ZodForge Cloud <noreply@zodforge.dev>",
    "to": "YOUR_EMAIL@example.com",
    "subject": "Test Email",
    "html": "<h1>Test from ZodForge</h1>"
  }'
```

**Expected response:**
```json
{
  "id": "re_...",
  "from": "noreply@zodforge.dev",
  "to": "YOUR_EMAIL@example.com",
  "created_at": "2025-10-21T..."
}
```

---

## 📧 **Email Template Preview**

Customer will receive this email:

**Subject:** Your ZodForge Cloud API Key - PRO Plan

**From:** ZodForge Cloud <noreply@zodforge.dev>

**Body:**
- 🎉 Welcome header with gradient
- 🔑 API key in monospace font (e.g., `zf_abc123...`)
- 💻 Quick start curl command
- ✨ Feature highlights (5,000 requests/month, GPT-4 + Claude)
- 📚 CTA button to documentation
- 💬 Support footer

---

## ⚠️ **Common Issues**

### Issue 1: "Customer not found in database"
**Cause:** Email typo or customer hasn't been created yet.
**Fix:** Check Supabase `customers` table for the email.

### Issue 2: "Invalid API key" (Resend error)
**Cause:** Wrong RESEND_API_KEY.
**Fix:**
1. Go to: https://resend.com/api-keys
2. Create new API key
3. Update `.env` and Vercel env vars
4. Rerun script

### Issue 3: "Email bounced"
**Cause:** Recipient email server rejected the email.
**Fix:**
1. Check email address is valid
2. Use different sender domain (verify in Resend)
3. Ask customer to whitelist `noreply@zodforge.dev`

### Issue 4: Email arrives but API key doesn't work
**Cause:** API key hash in database doesn't match.
**Fix:** Regenerate key using manual script.

---

## ✅ **Checklist**

- [ ] `.env` file created in `zodforge-landing/`
- [ ] Manual resend script executed successfully
- [ ] Customer received email (check spam if not in inbox)
- [ ] RESEND_API_KEY added to Vercel environment variables
- [ ] Vercel site redeployed
- [ ] Test payment made to verify future emails work
- [ ] Resend dashboard shows "Delivered" status

---

## 📞 **Need Help?**

- **Resend Support:** support@resend.com
- **Stripe Support:** https://support.stripe.com
- **Vercel Support:** https://vercel.com/support
- **ZodForge Setup Docs:** See SETUP.md

---

**Built with** [Claude Code](https://claude.com/claude-code)
