# Deployment Checklist

Quick reference for deploying ZodForge Cloud to production.

---

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Required

Add these to Vercel Dashboard (Settings → Environment Variables):

| Variable | Where to Get It | Example Format |
|----------|----------------|----------------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys | `sk_test_51...` or `sk_live_51...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → API Keys | `pk_test_51...` or `pk_live_51...` |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Same as above (for client-side) | `pk_test_51...` or `pk_live_51...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → Endpoint | `whsec_...` |
| `SUPABASE_URL` | Supabase Dashboard → Project Settings → API | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase Dashboard → Project Settings → API (service_role) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `RESEND_API_KEY` | Resend Dashboard → API Keys | `re_...` |

**⚠️ IMPORTANT:** Never commit real values to git! Only add them in Vercel dashboard.

---

## 📋 Step-by-Step Deployment

### Step 1: Setup Services (First Time Only)

1. **Stripe**
   - Create products and pricing
   - Get API keys
   - See: `docs/setup/STRIPE-SETUP.md`

2. **Supabase**
   - Create database tables
   - Get project URL and service key
   - See: `docs/setup/SUPABASE-SETUP.md`

3. **Resend**
   - Get API key
   - (Optional) Verify domain for production
   - See: `docs/setup/RESEND-SETUP.md`

### Step 2: Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Framework: **Astro**
4. Add environment variables (from table above)
5. Deploy

See: `docs/deployment/VERCEL-DEPLOY.md`

### Step 3: Configure Stripe Webhook

**AFTER deployment**, add webhook endpoint in Stripe:

1. Go to: Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://YOUR_DOMAIN.vercel.app/api/webhook`
3. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret
5. Add to Vercel: `STRIPE_WEBHOOK_SECRET`
6. Redeploy Vercel

---

## 🧪 Post-Deployment Testing

### Test 1: Health Check
```bash
curl https://YOUR_DOMAIN.vercel.app/
# Should return 200 OK
```

### Test 2: Payment Flow
1. Visit your deployed site
2. Click "Subscribe" on Pro plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Check email arrives
6. Verify customer in Supabase

### Test 3: API Key Works
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

---

## 🔒 Security Reminders

- [ ] Never commit `.env` files to git
- [ ] Use `.env.example` with placeholder values only
- [ ] Rotate API keys every 90 days
- [ ] Use separate keys for test/production
- [ ] Enable 2FA on all services (Stripe, Supabase, Resend, Vercel)
- [ ] Monitor webhook logs for suspicious activity

---

## 📊 Monitoring

After deployment, monitor:

1. **Vercel Dashboard**
   - Function logs: Check for errors in `/api/webhook`
   - Analytics: Track page views

2. **Stripe Dashboard**
   - Payments: Monitor successful checkouts
   - Webhooks: Check delivery status

3. **Resend Dashboard**
   - Emails: Verify delivery status
   - Check for bounces

4. **Supabase Dashboard**
   - Table Editor: Review new customers
   - Logs: Check for database errors

---

## 🆘 Troubleshooting

### Webhook not receiving events
- Check webhook URL is correct in Stripe
- Verify `STRIPE_WEBHOOK_SECRET` in Vercel
- Check Vercel function logs

### Email not sending
- Verify `RESEND_API_KEY` in Vercel
- Check Resend dashboard for delivery attempts
- For production, ensure domain is verified

### Customer not created in Supabase
- Check `SUPABASE_SERVICE_KEY` is correct (not anon key!)
- Verify tables exist
- Check Supabase logs

See: `docs/troubleshooting/` for detailed guides

---

## 📚 Documentation Structure

```
docs/
├── setup/
│   ├── STRIPE-SETUP.md          # Payment processing
│   ├── SUPABASE-SETUP.md        # Database setup
│   └── RESEND-SETUP.md          # Email delivery
├── deployment/
│   ├── VERCEL-DEPLOY.md         # Deployment guide
│   └── DEPLOYMENT-CHECKLIST.md  # This file
└── troubleshooting/
    └── FIX-MISSING-EMAIL.md     # Email issues
```

---

## 🎉 Success Criteria

- [ ] All environment variables configured in Vercel
- [ ] Site deployed and accessible
- [ ] Stripe webhook configured and receiving events
- [ ] Test payment completed successfully
- [ ] Email delivered with API key
- [ ] Customer record created in Supabase
- [ ] API key works with ZodForge API

---

**Built with** [Claude Code](https://claude.com/claude-code)
