# 🎯 How to Find Your Stripe Price IDs

**You're almost there!** Just 2 more IDs needed.

---

## Quick Guide (2 minutes)

### Step 1: Go to Products Page
Open: https://dashboard.stripe.com/test/products

You should see 2 products:
- ZodForge Cloud - Pro ($19/month)
- ZodForge Cloud - Enterprise ($99/month)

### Step 2: Click on Pro Product
1. Click on **"ZodForge Cloud - Pro"** name (clickable link)
2. You'll see a page with product details
3. Look for the **"Pricing"** section (middle of page)
4. You'll see something like:

```
Pricing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
$19.00 per month

API ID: price_XXXXXXXXXXXXX   [Copy]
```

5. **Copy that entire `price_XXXXXXXXXXXXX` string**

### Step 3: Click on Enterprise Product
1. Go back to Products: https://dashboard.stripe.com/test/products
2. Click on **"ZodForge Cloud - Enterprise"** name
3. Look for the **"Pricing"** section again
4. Copy the `price_XXXXXXXXXXXXX` string

### Step 4: Send Me Both IDs
Just reply with both IDs like this:

```
Pro: price_XXXXXXXXXXXXX
Enterprise: price_XXXXXXXXXXXXX
```

---

## Alternative: Create New Products with Clear Pricing

If you can't find the Price IDs, let's create fresh products:

### Option A: Start Fresh (5 minutes)

1. Go to: https://dashboard.stripe.com/test/products
2. Click **+ Add product** (top right)
3. Fill in:
   - **Name**: `ZodForge Cloud - Pro`
   - **Description**: `Professional plan with 5,000 API requests per month`
   - **Pricing model**: Standard pricing
   - **Price**: `19` USD
   - **Billing period**: `Monthly`
   - Click **Add product**
4. **Immediately after creation**, you'll see the Price ID on the screen - copy it!
5. Repeat for Enterprise ($99/month)

---

## What Happens Next

Once you send me the 2 Price IDs, I'll:
1. ✅ Update Pricing.astro (30 seconds)
2. ✅ Commit and push to GitHub (30 seconds)
3. ✅ Give you ready-to-paste Vercel config (1 minute)
4. ✅ Deploy to Vercel (3 minutes)
5. ✅ Test payment (5 minutes)

**Total time after you provide IDs**: 10 minutes to live! 🚀

---

## Your Product IDs (for reference)
- Pro Product: `prod_TGpdvxkF8toPsy`
- Enterprise Product: `prod_TGpeqxzlsku6bg`

These are products, but we need the **prices** inside them!
