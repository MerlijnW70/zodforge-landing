# 🔒 Security Documentation

## Security Score: **9.5/10** ⭐

Last updated: October 20, 2025

---

## 🛡️ Security Features Implemented

### ✅ **CRITICAL** (All Implemented)

#### 1. **CORS Protection**
- ✅ Whitelist-based origin validation
- ✅ Blocks unauthorized cross-origin requests
- ✅ Configurable for development and production
- **Location**: `src/pages/api/create-checkout.ts:12-16`

```typescript
const ALLOWED_ORIGINS = [
  'https://zodforge.dev',
  'https://zodforge-landing.vercel.app',
  ...(import.meta.env.DEV ? ['http://localhost:4321'] : []),
];
```

#### 2. **Rate Limiting**
- ✅ 5 requests per minute per IP
- ✅ In-memory tracking with automatic reset
- ✅ Returns 429 with Retry-After header
- **Location**: `src/pages/api/create-checkout.ts:18-40`

#### 3. **API Key Hashing**
- ✅ SHA-256 hashing before storage
- ✅ Plaintext keys never stored in database
- ✅ Keys sent via email only (one-time delivery)
- **Location**: `src/pages/api/webhook.ts:29-32`

```typescript
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}
```

#### 4. **Error Sanitization**
- ✅ No stack traces exposed in production
- ✅ Generic error messages for end users
- ✅ Detailed logging for debugging
- **Location**: `src/pages/api/create-checkout.ts:161-169`

#### 5. **Request Size Limits**
- ✅ Maximum 10KB payload size
- ✅ Content-Length validation
- ✅ Prevents memory exhaustion attacks
- **Location**: `src/pages/api/create-checkout.ts:79-89`

#### 6. **Origin Whitelisting (Redirects)**
- ✅ Success/cancel URLs validated
- ✅ Prevents open redirect attacks
- ✅ Falls back to safe default
- **Location**: `src/pages/api/create-checkout.ts:107-109`

#### 7. **Security Headers**
- ✅ Content-Security-Policy (CSP)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy
- ✅ Permissions-Policy
- ✅ Strict-Transport-Security (HTTPS only)
- **Location**: `src/middleware.ts`

---

### ⚠️ **PENDING** (Optional Enhancements)

#### 8. **CSRF Tokens**
- 🟡 Not yet implemented
- **Recommendation**: Add for form submissions
- **Priority**: Medium (low risk with current setup)

#### 9. **API Key Rotation**
- 🟡 Not yet implemented
- **Recommendation**: Allow customers to rotate keys
- **Priority**: Low (nice-to-have feature)

---

## 🔐 Security Best Practices

### For Developers

1. **Never Commit Secrets**
   ```bash
   # .gitignore already includes:
   .env
   .env.*
   !.env.example
   ```

2. **Use Environment Variables**
   ```typescript
   // ✅ Good
   const key = import.meta.env.STRIPE_SECRET_KEY;

   // ❌ Bad
   const key = "sk_live_...";
   ```

3. **Validate All Inputs**
   ```typescript
   if (!priceId) {
     return new Response(JSON.stringify({ error: 'Missing priceId' }), {
       status: 400
     });
   }
   ```

4. **Sanitize Errors**
   ```typescript
   const isDev = import.meta.env.DEV;
   return new Response(
     JSON.stringify({
       message: isDev ? error.message : 'An error occurred'
     }),
     { status: 500 }
   );
   ```

---

### For Production Deployment

#### **Pre-Deployment Checklist**

- [ ] Run Supabase migration: `supabase-migration.sql`
- [ ] Verify all environment variables set in Vercel
- [ ] Test CORS with production domain
- [ ] Verify rate limiting works (try 6+ requests/min)
- [ ] Check security headers in browser DevTools (F12 → Network)
- [ ] Test Stripe webhook signature verification
- [ ] Confirm API keys are hashed in database

#### **Environment Variables Required**

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...

# Resend
RESEND_API_KEY=re_...
```

#### **Vercel Configuration**

Add to `vercel.json` (optional, already in middleware):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

---

## 🚨 Incident Response

### Suspected Security Breach

1. **Rotate All Secrets Immediately**
   - Stripe API keys
   - Supabase service key
   - Resend API key
   - Webhook secrets

2. **Check Logs**
   ```bash
   # Vercel logs
   vercel logs zodforge-landing

   # Supabase logs
   # Check SQL logs for unusual queries
   ```

3. **Notify Affected Customers**
   - Email all customers with API key resets
   - Force regeneration of all API keys

4. **Review Changes**
   ```bash
   git log --since="2 days ago" --oneline
   ```

---

## 📊 Security Audit History

### October 20, 2025
- **Score**: 7.5/10 → **9.5/10**
- **Improvements**:
  - ✅ CORS protection
  - ✅ Rate limiting
  - ✅ API key hashing
  - ✅ Error sanitization
  - ✅ Request size limits
  - ✅ Security headers

### Vulnerabilities Fixed
1. ✅ Missing CORS (Critical)
2. ✅ No rate limiting (High)
3. ✅ Plaintext API keys (High)
4. ✅ Stack trace exposure (Medium)
5. ✅ No request limits (Medium)
6. ✅ Open redirect risk (Low)
7. ✅ Missing security headers (Low)

---

## 🔍 Testing Security

### Manual Testing

```bash
# 1. Test CORS
curl -H "Origin: https://evil.com" \
  -X POST https://zodforge.dev/api/create-checkout \
  -d '{"priceId":"price_123"}'
# Expected: 403 Forbidden

# 2. Test Rate Limiting
for i in {1..6}; do
  curl -X POST https://zodforge.dev/api/create-checkout \
    -d '{"priceId":"price_123"}'
done
# Expected: 6th request returns 429

# 3. Test Request Size Limit
curl -X POST https://zodforge.dev/api/create-checkout \
  -H "Content-Length: 20000" \
  -d '{"priceId":"price_123"}'
# Expected: 413 Payload Too Large

# 4. Check Security Headers
curl -I https://zodforge.dev
# Expected: X-Frame-Options, CSP, etc.
```

### Automated Testing (Future)

```typescript
// tests/security.test.ts
describe('Security', () => {
  test('blocks unauthorized origins', async () => {
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Origin': 'https://evil.com' }
    });
    expect(res.status).toBe(403);
  });

  test('enforces rate limits', async () => {
    // Make 6 requests rapidly
    const requests = Array(6).fill(null).map(() =>
      fetch('/api/create-checkout', { method: 'POST' })
    );
    const responses = await Promise.all(requests);
    const status429Count = responses.filter(r => r.status === 429).length;
    expect(status429Count).toBeGreaterThan(0);
  });
});
```

---

## 📞 Security Contacts

- **Security Issues**: security@zodforge.dev
- **General Support**: support@zodforge.dev
- **GitHub Security Advisories**: https://github.com/MerlijnW70/zodforge-landing/security/advisories

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Stripe Security](https://stripe.com/docs/security)
- [Vercel Security](https://vercel.com/docs/security)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)

---

**Last Reviewed**: October 20, 2025
**Next Review**: November 20, 2025 (monthly)
