# How to Find Your Supabase Service Role Key

⚠️ **Important**: You need the **`service_role`** key, NOT the `anon` key!

---

## Quick Steps

1. **Go to your Supabase project**:
   - Visit: https://supabase.com/dashboard → Select your project

2. **Navigate to Settings → API**:
   - Click the **Settings** gear icon in the left sidebar
   - Click **API**

3. **Scroll down to "Project API keys"** section

4. **Find the `service_role` key**:
   - You'll see two keys:
     - **`anon` (public)** ← ❌ NOT this one!
     - **`service_role` (secret)** ← ✅ This is the one you need!

5. **Click "Reveal"** next to `service_role`

6. **Copy the full key**:
   - It will be very long (~200+ characters)
   - Starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Example (yours will be different):
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IllvdXJQcm9qZWN0UmVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYyMzg1MDAwMCwiZXhwIjoyMzc5NTg3MTk5fQ.YOUR_SIGNATURE_HERE
     ```

---

## Why service_role and not anon?

| Key | Purpose | Access Level |
|-----|---------|-------------|
| `anon` | Client-side queries | Limited by Row Level Security (RLS) |
| `service_role` | **Backend operations** | **Full database access (bypasses RLS)** |

**For ZodForge Cloud**, we need `service_role` because:
- ✅ Webhook needs to INSERT new customers (bypasses RLS)
- ✅ API needs to INSERT usage records (bypasses RLS)
- ✅ Backend needs to UPDATE subscription status (bypasses RLS)

The `anon` key would be **blocked by RLS policies** and fail to insert/update data.

---

## Security

**⚠️ NEVER commit this key to Git!**

- Store in `.env` file (which is in `.gitignore`)
- Add to Vercel/Railway environment variables
- Do NOT expose to client-side code

---

## Next: Add to .env

Once you have the `service_role` key, add it to `.env`:

```env
SUPABASE_URL=https://lnmkkpgzjdavkehxeihs.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc... # Paste your service_role key here
```

---

**Built with** [Claude Code](https://claude.com/claude-code)
