# ZodForge Cloud - Landing Page & Revenue System

Beautiful, production-ready landing page with integrated Stripe payments, automated email delivery, and database storage for ZodForge Cloud API.

**Live Demo**: [zodforge.dev](https://zodforge.dev) _(coming soon)_

---

## 🚀 Features

- ✅ **Beautiful Landing Page** - Built with Astro + TailwindCSS
- ✅ **Stripe Integration** - Complete payment flow with Checkout + Webhooks
- ✅ **Email Automation** - Resend integration for API key delivery
- ✅ **Database** - Supabase for customer and usage tracking
- ✅ **3 Pricing Tiers** - Free, Pro ($19/mo), Enterprise ($99/mo)
- ✅ **Serverless** - Deployed on Vercel Edge Functions
- ✅ **Type-Safe** - TypeScript throughout
- ✅ **Production-Ready** - Security hardened, error handling, logging

---

## 📋 Prerequisites

- Node.js 18+
- npm or pnpm
- Accounts for:
  - [Stripe](https://stripe.com) (payment processing)
  - [Supabase](https://supabase.com) (database)
  - [Resend](https://resend.com) (email delivery)
  - [Vercel](https://vercel.com) (hosting - optional)

---

## 🛠️ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Stripe (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (get from https://supabase.com/dashboard)
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_SERVICE_KEY=eyJh...

# Resend (get from https://resend.com/api-keys)
RESEND_API_KEY=re_...

# Public keys (exposed to client)
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:4321

---

## 📦 Project Structure

```
zodforge-landing/
├── src/
│   ├── components/
│   │   ├── Hero.astro          # Hero section with CTA
│   │   ├── Features.astro      # Feature showcase
│   │   └── Pricing.astro       # Pricing tiers
│   ├── layouts/
│   │   └── BaseLayout.astro    # Base HTML template
│   ├── pages/
│   │   ├── index.astro         # Home page
│   │   ├── success.astro       # Post-payment success page
│   │   └── api/
│   │       ├── create-checkout.ts  # Stripe checkout session
│   │       └── webhook.ts          # Stripe webhook handler
│   └── styles/
│       └── global.css          # Global styles + Tailwind
├── public/                     # Static assets
├── astro.config.mjs            # Astro configuration
├── tailwind.config.mjs         # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── .env.example                # Environment variable template
├── SETUP.md                    # Detailed setup guide
└── README.md                   # This file
```

---

## 🎨 Customization

### Update Pricing

Edit `src/components/Pricing.astro`:

```typescript
const pricingTiers = [
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    stripePriceId: 'price_YOUR_STRIPE_PRICE_ID', // Replace this
    // ...
  },
];
```

### Change Colors

Edit `tailwind.config.mjs`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#0ea5e9', // Change primary color
        // ...
      },
    },
  },
},
```

### Modify Email Template

Edit `src/pages/api/webhook.ts` → `sendApiKeyEmail()` function

---

## 🔧 Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. Import to Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Framework: Astro (auto-detected)
   - Add environment variables from `.env`
   - Deploy!

3. Configure Stripe Webhook:
   - Get your Vercel URL: `https://your-project.vercel.app`
   - In Stripe, add webhook endpoint: `https://your-project.vercel.app/api/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.*`
   - Copy webhook secret to Vercel env vars

### Deploy to Other Platforms

This project uses the Vercel adapter. To deploy elsewhere:

1. Remove `@astrojs/vercel` adapter
2. Add appropriate adapter (Netlify, Cloudflare, etc.)
3. Update `astro.config.mjs`

---

## 🧪 Testing

### Test Stripe Payment Flow

Use Stripe test mode with test cards:

**Test Card**:
- Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Test Flow**:
1. Click "Start Pro Trial" on local site
2. Complete checkout with test card
3. Verify redirect to `/success`
4. Check email for API key
5. Check Supabase `customers` table for new record

### Test Webhook Locally

Use [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
# Install Stripe CLI
npm install -g stripe

# Login
stripe login

# Forward webhook events to local server
stripe listen --forward-to localhost:4321/api/webhook

# Trigger test event
stripe trigger checkout.session.completed
```

---

## 📊 Database Schema

### `customers` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| stripe_customer_id | TEXT | Stripe customer ID |
| email | TEXT | Customer email |
| api_key | TEXT | Generated API key (starts with `zf_`) |
| tier | TEXT | Subscription tier (`pro`, `enterprise`) |
| subscription_status | TEXT | Subscription status (`active`, `canceled`, etc.) |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

### `usage` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| api_key | TEXT | References customers.api_key |
| endpoint | TEXT | API endpoint called |
| timestamp | TIMESTAMP | Request time |
| success | BOOLEAN | Request succeeded? |
| processing_time_ms | INTEGER | Processing time in ms |

---

## 🔒 Security

- ✅ **API Key Validation** - Webhook signature verification
- ✅ **Environment Variables** - All secrets in env vars (never committed)
- ✅ **Database Policies** - Row Level Security enabled in Supabase
- ✅ **HTTPS Only** - Enforced in production
- ✅ **Rate Limiting** - Via Vercel Edge Functions
- ✅ **Input Validation** - TypeScript + Zod schemas
- ✅ **Error Handling** - Comprehensive error handling and logging

**Never commit**:
- `.env` file
- API keys or secrets
- Customer data

---

## 💰 Revenue Model

### Pricing Tiers

| Tier | Price | Requests | Features |
|------|-------|----------|----------|
| Free | $0/mo | 100/mo | OpenAI only, Community support |
| Pro | $19/mo | 5,000/mo | OpenAI + Claude, Priority support, 99.99% SLA |
| Enterprise | $99/mo | Unlimited | All providers, Dedicated support, Custom integrations |

### Revenue Projections

Conservative estimates:

- **10 Pro users**: $190/month
- **2 Enterprise users**: $198/month
- **Total MRR**: ~$388/month
- **Annual Run Rate (ARR)**: ~$4,656/year

---

## 📈 Analytics & Monitoring

### Track Revenue

Query Supabase:

```sql
-- Total active subscriptions by tier
SELECT tier, COUNT(*) as count, COUNT(*) *
  CASE tier
    WHEN 'pro' THEN 19
    WHEN 'enterprise' THEN 99
    ELSE 0
  END as monthly_revenue
FROM customers
WHERE subscription_status = 'active'
GROUP BY tier;
```

### Monitor Usage

```sql
-- Usage by API key (last 7 days)
SELECT api_key, COUNT(*) as requests,
       AVG(processing_time_ms) as avg_time_ms
FROM usage
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY api_key
ORDER BY requests DESC;
```

---

## 🐛 Troubleshooting

### Webhook not working

1. Check Stripe webhook logs in dashboard
2. Verify webhook secret is correct in `.env`
3. Check Vercel function logs
4. Ensure webhook URL is correct

### Email not sending

1. Verify Resend API key
2. Check Resend dashboard for delivery attempts
3. For production, verify domain is configured
4. Check Vercel function logs

### Database errors

1. Verify Supabase service key (not anon key!)
2. Check table exists: `customers`, `usage`
3. Verify RLS policies allow service_role
4. Check Supabase logs

---

## 📚 Additional Resources

- [Setup Guide (SETUP.md)](./SETUP.md) - Detailed step-by-step setup
- [Astro Documentation](https://docs.astro.build)
- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)

---

## 🤝 Contributing

This is part of the ZodForge ecosystem. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

Built with:
- [Astro](https://astro.build) - Static site framework
- [TailwindCSS](https://tailwindcss.com) - CSS framework
- [Stripe](https://stripe.com) - Payment processing
- [Supabase](https://supabase.com) - Database
- [Resend](https://resend.com) - Email delivery
- [Vercel](https://vercel.com) - Hosting

**Generated with** [Claude Code](https://claude.com/claude-code)

---

**Questions?** Open an issue or email support@zodforge.dev
