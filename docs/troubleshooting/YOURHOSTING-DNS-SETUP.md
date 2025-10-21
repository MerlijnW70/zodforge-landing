# 📋 YourHosting.nl DNS Setup for Resend

## Your Situation

- Domain: `zodforge.dev`
- Hosting: **YourHosting.nl**
- Already added: CNAME for www → Vercel ✅
- Need to add: 4 email records for Resend

---

## Step 1: Login to YourHosting Control Panel

1. Go to: **https://www.yourhosting.nl/clientarea**
2. Login with your account
3. Find **"Mijn domeinen"** (My Domains)
4. Click on **`zodforge.dev`**
5. Look for **"DNS beheer"** or **"DNS instellingen"** (DNS management)

---

## Step 2: Add DNS Records

You need to add 4 records. For each record, click **"Nieuwe DNS record toevoegen"** (Add new DNS record):

---

### Record 1: MX (Mail Exchange)

```
Type:      MX
Host:      send
Waarde:    feedback-smtp.eu-west-1.amazonses.com
Prioriteit: 10
TTL:       3600 (or Auto/Default)
```

**Nederlands:**
- Type: **MX**
- Host/Naam: `send`
- Waarde/Bestemming: `feedback-smtp.eu-west-1.amazonses.com`
- Prioriteit: `10`
- TTL: `3600` of standaard

---

### Record 2: TXT (SPF Record)

```
Type:   TXT
Host:   send
Waarde: v=spf1 include:amazonses.com ~all
TTL:    3600
```

**Nederlands:**
- Type: **TXT**
- Host/Naam: `send`
- Waarde/Inhoud: `v=spf1 include:amazonses.com ~all`
- TTL: `3600` of standaard

**BELANGRIJK:** Geen aanhalingstekens ("") toevoegen als YourHosting dit automatisch doet!

---

### Record 3: TXT (DKIM Record - Long Value!)

```
Type:   TXT
Host:   resend._domainkey
Waarde: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3Mk5bWCcIEnNWssU3gd0yoki2IoLlRDO22WoUCLz3gkNgNWQmzabpniKApxp5g8d7QkijGS0I3/1sEbjVyzkrvpJ+t3xpkMYRm9k82ajMgJ2kBxwtp5BLuN45eo2B7i5fZtwvJLOvVg091TuEySpr2ge/NGjJyE9nvGSu5ASRswIDAQAB
TTL:    3600
```

**Nederlands:**
- Type: **TXT**
- Host/Naam: `resend._domainkey` (let op: underscore en punt!)
- Waarde/Inhoud: (kopieer de hele lange waarde hierboven)
- TTL: `3600` of standaard

**BELANGRIJK:**
- Dit is een HELE LANGE waarde (391 tekens)
- Kopieer het COMPLEET
- Sommige panels hebben een maximale lengte - als het niet past, contacteer YourHosting support

---

### Record 4: TXT (DMARC Record)

```
Type:   TXT
Host:   _dmarc
Waarde: v=DMARC1; p=none;
TTL:    3600
```

**Nederlands:**
- Type: **TXT**
- Host/Naam: `_dmarc` (let op: underscore aan het begin!)
- Waarde/Inhoud: `v=DMARC1; p=none;`
- TTL: `3600` of standaard

---

## Step 3: Verify Records Were Added

In YourHosting DNS beheer, zou je nu deze records moeten zien:

```
Type    Host/Naam              Waarde/Bestemming
────────────────────────────────────────────────────────────────────
CNAME   www                    9761ce6a730aa0d7.vercel-dns-016.com  ✅ (already added)
MX      send                   feedback-smtp.eu-west-1.amazonses.com (prioriteit 10)
TXT     send                   v=spf1 include:amazonses.com ~all
TXT     resend._domainkey      p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3Mk5b...
TXT     _dmarc                 v=DMARC1; p=none;
```

---

## Step 4: Wait for DNS Propagation (10-30 minutes)

YourHosting propagation can take 10-30 minutes (sometimes up to 1 hour).

**Check propagation:**
1. Go to: https://dnschecker.org
2. Enter: `resend._domainkey.zodforge.dev`
3. Type: **TXT**
4. Click "Search"
5. Wait until you see the DKIM value appear worldwide (green checkmarks)

**Also check:**
- `send.zodforge.dev` (Type: MX) - Should show the MX record
- `send.zodforge.dev` (Type: TXT) - Should show SPF record
- `_dmarc.zodforge.dev` (Type: TXT) - Should show DMARC record

---

## Step 5: Verify Domain in Resend

Once DNS has propagated (all green on dnschecker.org):

1. Go to: **https://resend.com/domains**
2. Click on **`zodforge.dev`**
3. Click **"Verify Records"** button
4. Should show: ✅ **"Domain verified"**

If not verified:
- Wait another 10-15 minutes (YourHosting can be slow)
- Click "Verify Records" again
- Check dnschecker.org to confirm records are live

---

## Step 6: Update Code & Send Email

Once domain is verified in Resend, I'll update the code to use `noreply@zodforge.dev`.

Then you can send the email:
```bash
npx tsx resend-email-manual.ts facturen@multimediagroup.nl
```

✅ **Email will be delivered!**

---

## 🔍 Common YourHosting Issues

### Issue 1: DKIM Value Too Long
**Problem:** YourHosting TXT record field has character limit

**Solution:**
- Contact YourHosting support: support@yourhosting.nl
- Ask them to add the DKIM record manually
- Or ask if they support multiple TXT strings

### Issue 2: Can't Find DNS Settings
**Look for these Dutch terms:**
- "DNS beheer"
- "DNS instellingen"
- "DNS records"
- "Nameserver instellingen"
- "Domein configuratie"

**If still can't find:**
- Contact YourHosting support (live chat usually available)
- They can add records for you

### Issue 3: Records Not Saving
**Solutions:**
- Make sure you click "Opslaan" (Save) after each record
- Some panels require saving after ALL records (not per record)
- Check for validation errors (red text)
- Try different browsers (Chrome, Firefox)

### Issue 4: DNS Propagation Very Slow
**YourHosting can be slower than other providers:**
- Wait up to 1 hour
- Check dnschecker.org every 10 minutes
- If after 2 hours still not propagated → Contact support

---

## 📱 YourHosting Support

**If you need help:**
- Live chat: https://www.yourhosting.nl (bottom right corner)
- Email: support@yourhosting.nl
- Telefoon: 085 - 48 88 333
- Support hours: Ma-Vr 09:00-17:30

**What to ask:**
"Ik wil graag 4 DNS records toevoegen voor email verificatie (Resend). Kan je me helpen met het toevoegen van MX en TXT records voor send.zodforge.dev, resend._domainkey.zodforge.dev en _dmarc.zodforge.dev?"

They're usually very helpful!

---

## 🎯 Next Steps

1. ✅ **Login to YourHosting** control panel
2. ✅ **Go to DNS settings** for zodforge.dev
3. ✅ **Add 4 records** (MX + 3 TXT)
4. ⏳ **Wait 30 minutes** for propagation
5. ✅ **Verify in Resend**
6. ✅ **Send email** to customer

**Total time: ~45 minutes** (including DNS propagation wait)

---

**Let me know when you've added the records and I'll help verify!** 🚀

Or if you need help finding the DNS settings in YourHosting panel, take a screenshot and I'll guide you! 📸
