# 📧 Matratex Email Setup

## 🏢 **Vaša doména: matratex@matratex.sk**

### **1. Nastavenie environment variables:**

```bash
# Váš SMTP server (zvyčajne mail.vašadoména.sk)
export EMAIL_HOST="mail.matratex.sk"

# Port (zvyčajne 587 alebo 465)
export EMAIL_PORT="587"

# Secure (false pre 587, true pre 465)
export EMAIL_SECURE="false"

# Vaša email adresa
export EMAIL_USER="matratex@matratex.sk"

# Vaše email heslo
export EMAIL_PASS="your-email-password"
```

### **2. Alternatívne porty (ak 587 nefunguje):**

```bash
# Port 465 (SSL)
export EMAIL_PORT="465"
export EMAIL_SECURE="true"

# Port 25 (bez SSL)
export EMAIL_PORT="25"
export EMAIL_SECURE="false"
```

### **3. Testovanie:**

```bash
# Restartujte backend
cd backend
npm run start:dev

# Testujte email pripojenie
curl http://localhost:3001/invoices/test-email
```

### **4. Bežné SMTP servery:**

- **cPanel hosting:** `mail.matratex.sk` (port 587)
- **GoDaddy:** `smtpout.secureserver.net` (port 465)
- **Namecheap:** `mail.matratex.sk` (port 587)
- **SiteGround:** `mail.matratex.sk` (port 587)

### **5. Kontrola s poskytovateľom hostingu:**

Ak nefunguje, kontaktujte svojho hosting poskytovateľa a opýtajte sa:

- SMTP server adresa
- Port (587, 465, alebo 25)
- SSL/TLS nastavenia
- Autentifikácia (username/password)

### **6. Firewall a bezpečnosť:**

Uistite sa, že:

- Port 587 alebo 465 je otvorený
- Firewall neblokuje SMTP pripojenie
- Email účet má povolené SMTP prístupy

## 🎯 **Výhody Matratex domény:**

- ✅ **Profesionálny vzhľad** - matratex@matratex.sk
- ✅ **Dôveryhodnosť** - zákazníci vidia vašu doménu
- ✅ **Branding** - konzistentné s vašou firmou
- ✅ **Kontrola** - plná kontrola nad email serverom

## 📋 **Kontrola nastavenia:**

1. **Backend logy** - skontrolujte či sa email transporter inicializoval
2. **Test endpoint** - `/invoices/test-email`
3. **Vytvorenie faktúry** - skontrolujte či sa email pošle
4. **Zákazníci s emailom** - uistite sa, že majú platné email adresy

**Matratex email je pripravený na použitie!** 🎉
