-- Migration: Add api_key_hash column and remove api_key column
-- Run this in Supabase SQL Editor

-- 1. Add new api_key_hash column (nullable initially)
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS api_key_hash VARCHAR(64);

-- 2. For existing customers with plaintext api_key, hash them
-- WARNING: This will invalidate existing API keys!
-- You may want to notify existing customers or handle migration differently

-- Option A: Drop the old api_key column (DESTRUCTIVE - existing keys will stop working)
-- ALTER TABLE customers DROP COLUMN IF EXISTS api_key;

-- Option B: Keep both columns temporarily for migration period
-- Then drop api_key column after all customers have been notified
-- ALTER TABLE customers RENAME COLUMN api_key TO api_key_deprecated;

-- 3. Make api_key_hash required for new customers
ALTER TABLE customers
ALTER COLUMN api_key_hash SET NOT NULL;

-- 4. Add index on api_key_hash for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_api_key_hash
ON customers(api_key_hash);

-- 5. Add created_at index for analytics
CREATE INDEX IF NOT EXISTS idx_customers_created_at
ON customers(created_at DESC);

-- 6. Add comments for documentation
COMMENT ON COLUMN customers.api_key_hash IS 'SHA-256 hash of the API key for secure storage';

-- 7. Verify structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'customers';
