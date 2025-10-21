# ✅ Next Steps After DNS Propagation

## Current Status

✅ **Completed:**
- All 4 DNS records added in YourHosting.nl
- Code updated to use onboarding@resend.dev (temporary)
- Troubleshooting tools created
- Documentation updated
- Changes committed to git

⏳ **In Progress:**
- DNS propagation (started ~10-30 minutes ago)
- Waiting for domain verification in Resend

---

## Step 1: Verify DNS Propagation (Check Now!)

Go to: **https://dnschecker.org**

Check these 4 records:

### Check 1: DKIM (Most Important)
- Hostname: `resend._domainkey.zodforge.dev`
- Type: **TXT**
- Expected: `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3Mk5b...`
- Status: 🟢 Green worldwide = Ready!

### Check 2: SPF
- Hostname: `send.zodforge.dev`
- Type: **TXT**
- Expected: `v=spf1 include:amazonses.com ~all`

### Check 3: MX
- Hostname: `send.zodforge.dev`
- Type: **MX**
- Expected: `10 feedback-smtp.eu-west-1.amazonses.com`

### Check 4: DMARC
- Hostname: `_dmarc.zodforge.dev`
- Type: **TXT**
- Expected: `v=DMARC1; p=none;`

**If all 4 show green checkmarks → Proceed to Step 2!**

---

## Step 2: Verify Domain in Resend

1. Go to: **https://resend.com/domains**
2. Click on **`zodforge.dev`**
3. Click **"Verify Records"** button
4. Wait 5-10 seconds
5. Should show: ✅ **"Domain verified successfully"**

**If verification fails:**
- Wait another 10 minutes
- Check dnschecker.org again
- Try "Verify Records" again
- DNS can take up to 1 hour for YourHosting

---

## Step 3: Update Email Sender to Use Your Domain

Once domain is verified, update the webhook:

```typescript
// In: src/pages/api/webhook.ts (line 38)

// Change from:
from: 'ZodForge Cloud <onboarding@resend.dev>',

// To:
from: 'ZodForge Cloud <noreply@zodforge.dev>',
```

**Also update:**
```typescript
// In: docs/troubleshooting/resend-email-manual.ts (line 121)

// Change from:
from: 'ZodForge Cloud <onboarding@resend.dev>',

// To:
from: 'ZodForge Cloud <noreply@zodforge.dev>',
```

**Commit the changes:**
```bash
git add src/pages/api/webhook.ts docs/troubleshooting/resend-email-manual.ts
git commit -m "feat: Use verified zodforge.dev domain for emails"
git push
```

---

## Step 4: Add RESEND_API_KEY to Vercel

**Critical:** The webhook runs on Vercel, so it needs the API key!

### Option A: Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select project: **zodforge-landing** (or zodforge)
3. Settings → Environment Variables
4. Click **"Add New"**
5. Fill in:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_YOUR_API_KEY_FROM_RESEND_DASHBOARD`
   - **Environments:** ✅ Production, ✅ Preview
6. Click **"Save"**

### Option B: Vercel CLI
```bash
cd zodforge-landing
vercel env add RESEND_API_KEY
# When prompted, paste: re_YOUR_API_KEY_FROM_RESEND_DASHBOARD
# Select: Production, Preview
```

---

## Step 5: Deploy to Vercel

Push your changes to trigger deployment:

```bash
cd zodforge-landing
git push origin main
```

**Or manually redeploy:**
1. Vercel Dashboard → zodforge project
2. Deployments → Latest → ... menu
3. Click **"Redeploy"**
4. Wait for deployment to complete (~2 minutes)

---

## Step 6: Test Email Delivery

### Test 1: Send to Customer

```bash
cd zodforge-landing
npx tsx docs/troubleshooting/resend-email-manual.ts facturen@multimediagroup.nl
```

**Expected output:**
```
🔍 Looking up customer: facturen@multimediagroup.nl...
✅ Customer found
📝 Generating NEW API key...
✅ Database updated
📧 Sending email...
✅ Email sent successfully!
```

### Test 2: Verify in Resend Dashboard

1. Go to: https://resend.com/emails
2. Look for email to `facturen@multimediagroup.nl`
3. Status should be: ✅ **"Delivered"**
4. Click to see details

### Test 3: Check Customer Inbox

Customer should receive email within 1-2 minutes:
- **From:** ZodForge Cloud <noreply@zodforge.dev>
- **Subject:** Your ZodForge Cloud API Key - PRO Plan
- **Contains:** API key starting with `zf_jwt_...`

---

## Step 7: Test Future Payments

Make a test Stripe payment to ensure webhook works:

1. Go to your landing page
2. Click "Subscribe" for Pro plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Use test email: `test@example.com`
5. Complete payment
6. Check Resend dashboard for email delivery
7. Check Vercel logs: https://vercel.com → Functions → api/webhook

---

## Troubleshooting

### Domain verification failing?
- Wait longer (up to 1 hour for YourHosting)
- Check dnschecker.org shows all 4 records
- Verify DNS records in YourHosting match exactly
- Contact Resend support if stuck after 2 hours

### Email still not sending?
- Check RESEND_API_KEY is in Vercel env vars
- Check Vercel deployment completed successfully
- Check Vercel function logs for errors
- Try manual script: `npx tsx docs/troubleshooting/resend-email-manual.ts facturen@multimediagroup.nl`

### Email delivered but customer didn't receive?
- Check spam/junk folder
- Check email address is correct in Supabase
- Check Resend dashboard shows "Delivered" not "Bounced"
- Ask customer to whitelist noreply@zodforge.dev

---

## Success Checklist

- [ ] DNS propagated (all green on dnschecker.org)
- [ ] Domain verified in Resend
- [ ] Email sender updated to noreply@zodforge.dev
- [ ] RESEND_API_KEY added to Vercel
- [ ] Changes deployed to Vercel
- [ ] Email sent to facturen@multimediagroup.nl
- [ ] Email shows "Delivered" in Resend
- [ ] Customer received the email
- [ ] Test payment works end-to-end

---

## 📧 Customer Email Will Contain

- Welcome message with tier (PRO)
- API key: `zf_jwt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Quick start curl command
- Feature highlights (5,000 requests/month, GPT-4 + Claude)
- Link to documentation
- Support contact info

---

## 🎉 When Complete

The email issue will be fully resolved:
- ✅ Domain verified with Resend
- ✅ Can send to any email address (not just gamingpod@gmail.com)
- ✅ Professional sender: noreply@zodforge.dev
- ✅ Webhook works automatically for future payments
- ✅ Customer has their API key

---

**Estimated Timeline:**
- DNS propagation: 10-30 minutes (may be done already!)
- Domain verification: 1 minute
- Code updates: 2 minutes
- Vercel deploy: 2 minutes
- Email delivery: 1 minute
- **Total: ~15 minutes after DNS is ready**

---

**Check dnschecker.org now to see if DNS has propagated!** 🚀
