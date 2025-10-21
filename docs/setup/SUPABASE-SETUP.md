# Supabase Setup Guide - ZodForge Cloud

**Time Required**: 10 minutes
**Cost**: Free tier (generous limits)

This guide walks you through setting up Supabase for customer and usage tracking.

---

## Prerequisites

✅ You have a Supabase account (https://supabase.com)
✅ You have your Supabase URL: `https://lnmkkpgzjdavkehxeihs.supabase.co`

---

## Step 1: Get API Keys (2 minutes)

1. **Navigate to Settings**:
   - In your Supabase project dashboard
   - Click **Settings** (gear icon in left sidebar)
   - Click **API**

2. **Copy Configuration**:

   **Project URL**:
   ```
   https://lnmkkpgzjdavkehxeihs.supabase.co
   ```
   Save as: **SUPABASE_URL**

   **API Keys**:
   - Find the **`service_role`** key (NOT the `anon` key!)
   - Click **Reveal** to show the full key
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...`
   - Save as: **SUPABASE_SERVICE_KEY**

3. **⚠️ Important**:
   - Use `service_role` key, NOT `anon` key (we need full database access)
   - NEVER commit this key to Git
   - Store it securely in `.env` (which is in `.gitignore`)

---

## Step 2: Create Database Tables (5 minutes)

### 2.1 Open SQL Editor

1. Click **SQL Editor** in left sidebar
2. Click **+ New query**

### 2.2 Run This SQL

Copy and paste this entire SQL script, then click **Run**:

```sql
-- =============================================
-- ZodForge Cloud Database Schema
-- =============================================

-- Table: customers
-- Stores customer information and API keys
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: usage
-- Tracks API usage for rate limiting and analytics
CREATE TABLE IF NOT EXISTS usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT NOT NULL REFERENCES customers(api_key) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  processing_time_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_api_key ON customers(api_key);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_id ON customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_api_key ON usage(api_key);
CREATE INDEX IF NOT EXISTS idx_usage_created_at ON usage(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow service_role full access, deny public access
CREATE POLICY "Service role has full access to customers"
  ON customers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to usage"
  ON usage
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Optional: Allow customers to read their own data (future feature)
-- Uncomment when adding customer dashboard
/*
CREATE POLICY "Customers can read their own data"
  ON customers
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Customers can read their own usage"
  ON usage
  FOR SELECT
  TO authenticated
  USING (api_key IN (SELECT api_key FROM customers WHERE email = auth.jwt() ->> 'email'));
*/

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'ZodForge Cloud database schema created successfully!';
  RAISE NOTICE 'Tables: customers, usage';
  RAISE NOTICE 'Indexes: 4 indexes created for performance';
  RAISE NOTICE 'RLS: Enabled with service_role policies';
END $$;
```

### 2.3 Verify Success

After running, you should see:
```
Success. No rows returned
NOTICE: ZodForge Cloud database schema created successfully!
NOTICE: Tables: customers, usage
```

---

## Step 3: Verify Tables (1 minute)

### 3.1 Check Tables

1. Click **Table Editor** in left sidebar
2. You should see two tables:
   - `customers` (0 rows)
   - `usage` (0 rows)

### 3.2 Check Schema

Click on `customers` table, you should see these columns:
- `id` (uuid, primary key)
- `stripe_customer_id` (text, unique)
- `email` (text)
- `api_key` (text, unique)
- `tier` (text) - 'free', 'pro', or 'enterprise'
- `subscription_status` (text) - 'active', 'canceled', 'past_due', or 'unpaid'
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

---

## Step 4: Update Environment Variables (2 minutes)

### For zodforge-landing

Edit `.env` in `zodforge-landing/`:

```env
# Supabase Configuration
SUPABASE_URL=https://lnmkkpgzjdavkehxeihs.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc... # Your service_role key from Step 1
```

### For zodforge-api (Railway)

1. Go to Railway Dashboard
2. Click on your zodforge-api project
3. Go to **Variables** tab
4. Add these two variables:
   ```
   SUPABASE_URL=https://lnmkkpgzjdavkehxeihs.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGc... # Your service_role key
   ```
5. Railway will auto-redeploy (takes ~2 minutes)

---

## Step 5: Test Database Connection (Optional)

You can test the database from the SQL Editor:

```sql
-- Insert test customer
INSERT INTO customers (stripe_customer_id, email, api_key, tier)
VALUES ('cus_test123', 'test@example.com', 'zf_test123', 'pro');

-- Verify insert
SELECT * FROM customers;

-- Insert test usage
INSERT INTO usage (api_key, endpoint, success, processing_time_ms)
VALUES ('zf_test123', '/api/v1/refine', true, 1500);

-- Verify usage tracking
SELECT * FROM usage;

-- Clean up test data
DELETE FROM usage WHERE api_key = 'zf_test123';
DELETE FROM customers WHERE api_key = 'zf_test123';
```

---

## Database Schema Reference

### customers Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Auto-generated primary key |
| stripe_customer_id | TEXT | Stripe customer ID (unique) |
| email | TEXT | Customer email address |
| api_key | TEXT | ZodForge API key (unique, starts with `zf_`) |
| tier | TEXT | Subscription tier: 'free', 'pro', 'enterprise' |
| subscription_status | TEXT | Status: 'active', 'canceled', 'past_due', 'unpaid' |
| created_at | TIMESTAMPTZ | Account creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp (auto-updated) |

**Indexes**:
- Primary key on `id`
- Unique index on `stripe_customer_id`
- Unique index on `api_key`
- Index on `api_key` for fast lookups

**Constraints**:
- `tier` must be one of: 'free', 'pro', 'enterprise'
- `subscription_status` must be one of: 'active', 'canceled', 'past_due', 'unpaid'

---

### usage Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Auto-generated primary key |
| api_key | TEXT | Foreign key to customers.api_key |
| endpoint | TEXT | API endpoint called (e.g., '/api/v1/refine') |
| success | BOOLEAN | Whether the request succeeded |
| processing_time_ms | INTEGER | Processing time in milliseconds |
| created_at | TIMESTAMPTZ | Request timestamp |

**Indexes**:
- Primary key on `id`
- Index on `api_key` for fast customer lookups
- Index on `created_at` for time-based queries

**Relationships**:
- `api_key` references `customers(api_key)` with CASCADE delete

---

## Security Features

### Row Level Security (RLS)

✅ **Enabled** on both tables

**Policies**:
- `service_role` (backend API) has full access
- Public access denied by default
- Future: Can add policies for authenticated customers to view their own data

### Best Practices

1. **Never use `anon` key for backend operations**
   - `anon` key: For client-side queries with RLS
   - `service_role` key: For backend operations (bypasses RLS)

2. **Keep service_role key secure**
   - Store in environment variables only
   - Never commit to Git
   - Never expose to client-side code

3. **Regular backups**
   - Supabase automatically backs up your database
   - Can download manual backups from Settings → Database → Backups

---

## Monitoring & Maintenance

### View Recent Customers

```sql
SELECT
  email,
  tier,
  subscription_status,
  created_at
FROM customers
ORDER BY created_at DESC
LIMIT 10;
```

### View Usage Statistics

```sql
-- Today's usage by tier
SELECT
  c.tier,
  COUNT(*) as requests,
  AVG(u.processing_time_ms) as avg_time_ms,
  SUM(CASE WHEN u.success THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as success_rate
FROM usage u
JOIN customers c ON u.api_key = c.api_key
WHERE u.created_at >= CURRENT_DATE
GROUP BY c.tier;
```

### Find Top Users

```sql
-- Top 10 users by request volume (last 30 days)
SELECT
  c.email,
  c.tier,
  COUNT(*) as total_requests
FROM usage u
JOIN customers c ON u.api_key = c.api_key
WHERE u.created_at >= NOW() - INTERVAL '30 days'
GROUP BY c.email, c.tier
ORDER BY total_requests DESC
LIMIT 10;
```

---

## Troubleshooting

### "permission denied for table customers"

**Cause**: Using `anon` key instead of `service_role` key

**Fix**:
1. Go to Supabase Settings → API
2. Copy the **`service_role`** key (not `anon`)
3. Update `SUPABASE_SERVICE_KEY` in your environment variables

---

### "relation 'customers' does not exist"

**Cause**: SQL schema not run yet

**Fix**: Run the SQL from Step 2.2 again

---

### Webhook inserts failing

**Cause**: Incorrect service_role key or RLS blocking inserts

**Fix**:
1. Verify `SUPABASE_SERVICE_KEY` is correct in Vercel
2. Check RLS policies are configured (Step 2.2)
3. Check Vercel function logs for detailed error

---

## Next Steps

After completing Supabase setup:

1. ✅ **Create Resend account** (5 min) - for email delivery
2. ✅ **Configure Stripe products** (10 min) - see STRIPE-SETUP.md
3. ✅ **Deploy to Vercel** (10 min) - see VERCEL-DEPLOY.md
4. ✅ **Test payment flow** - end-to-end verification

---

## Support

**Questions?**
- Supabase Docs: https://supabase.com/docs
- SQL Reference: https://www.postgresql.org/docs/
- ZodForge Setup: See SETUP.md
- Email: support@zodforge.dev

**Built with** [Claude Code](https://claude.com/claude-code)
