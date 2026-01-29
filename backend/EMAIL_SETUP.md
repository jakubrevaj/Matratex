# 📧 Email Service Setup

## 🏢 **MATRATEX DOMÉNA (matratex@matratex.sk):**

### **1. Matratex SMTP (Vaša doména):**

```bash
export EMAIL_HOST="mail.matratex.sk"
export EMAIL_PORT="587"
export EMAIL_SECURE="false"
export EMAIL_USER="matratex@matratex.sk"
export EMAIL_PASS="your-email-password"
```

---

## 🚀 **Rýchle nastavenie:**

### **1. Gmail (Odporúčané pre testovanie):**

1. **Vytvorte App Password:**

   - Choďte na [Google Account Security](https://myaccount.google.com/security)
   - Zapnite 2-Factor Authentication
   - Vytvorte "App Password" pre "Mail"
   - Skopírujte vygenerované heslo

2. **Nastavte environment variables:**
   ```bash
   export EMAIL_USER="your-email@gmail.com"
   export EMAIL_PASS="your-16-character-app-password"
   ```

### **2. SendGrid (Pre produkciu):**

1. **Zaregistrujte sa na [SendGrid](https://sendgrid.com/)**
2. **Vytvorte API Key**
3. **Nastavte environment variables:**
   ```bash
   export SENDGRID_API_KEY="your-sendgrid-api-key"
   ```

### **3. Mailgun (Alternatíva):**

1. **Zaregistrujte sa na [Mailgun](https://www.mailgun.com/)**
2. **Vytvorte API Key**
3. **Nastavte environment variables:**
   ```bash
   export MAILGUN_API_KEY="your-mailgun-api-key"
   export MAILGUN_DOMAIN="your-mailgun-domain"
   ```

## 🔧 **Konfigurácia:**

### **Gmail SMTP:**

```typescript
// backend/src/config/email.config.ts
export const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password, nie vaše heslo!
  },
};
```

### **SendGrid:**

```typescript
// Uncomment v email.config.ts
sendgrid: {
  apiKey: process.env.SENDGRID_API_KEY,
},
```

## 🧪 **Testovanie:**

### **1. Test email pripojenia:**

```bash
curl http://localhost:3001/invoices/test-email
```

### **2. Test odoslania faktúry:**

- Vytvorte faktúru z objednávky
- Skontrolujte backend logy
- Email sa pošle automaticky (ak má zákazník email)

### **3. Test upomienky:**

- Vytvorte faktúru s minulým due_date
- Kliknite "Upomienka" v payment status dashboard
- Skontrolujte backend logy

## 📋 **Kontrola zákazníkov:**

### **Zákazníci s email adresou:**

```sql
SELECT podnik, email FROM customers WHERE email IS NOT NULL AND email != '';
```

### **Zákazníci bez email adresy:**

```sql
SELECT podnik, email FROM customers WHERE email IS NULL OR email = '';
```

## ⚠️ **Dôležité poznámky:**

1. **Gmail App Password:** Vždy používajte App Password, nie vaše Gmail heslo
2. **Email validácia:** Systém automaticky kontroluje platnosť email adresy
3. **Fallback:** Ak zákazník nemá email, systém to loguje ale pokračuje
4. **Templates:** Email templates sú v `email.config.ts`
5. **Logs:** Všetky email operácie sa logujú do konzoly

## 🎯 **Funkcie:**

- ✅ **Automatické odosielanie faktúr** pri vytvorení
- ✅ **Upomienky** pre po splatnosti faktúry
- ✅ **Email validácia** a kontrola existencie
- ✅ **HTML templates** s pekným dizajnom
- ✅ **Error handling** a logging
- ✅ **Testovanie pripojenia**

## 🔄 **Nasadenie:**

1. **Nastavte environment variables** na serveri
2. **Restartujte backend** server
3. **Otestujte** email pripojenie
4. **Skontrolujte** logy pre chyby

**Email service je pripravený na použitie!** 🎉
