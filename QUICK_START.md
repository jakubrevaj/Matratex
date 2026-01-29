# ⚡ Quick Start Guide

## 🚀 Rýchle spustenie systému

### 1️⃣ Konfigurácia (JEDNORAZOVO)

```bash
# Backend .env (ak nemáš)
cd backend
cp env.example .env
nano .env  # Uprav DB credentials, EMAIL heslo
```

**Dôležité premenné:**

```bash
DB_USERNAME=tvoj_user
DB_PASSWORD=tvoje_heslo
EMAIL_PASS=tvoje_email_heslo
OWNER_EMAIL=revaj@matratex.sk
```

---

### 2️⃣ Spustenie

#### Terminal 1 - Backend:

```bash
cd backend
npm run start:dev
```

**Očakávaný výstup:**

```
🚀 Server beží na http://localhost:3002
📊 Dashboard: http://localhost:3002/dashboard
📄 PDFs: http://localhost:3002/pdfs
```

#### Terminal 2 - Frontend:

```bash
cd frontend
npm run dev
```

**Výstup:**

```
▲ Next.js 15.2.4
- Local:        http://localhost:3001
- Network:      http://192.168.1.XXX:3001
```

---

### 3️⃣ Otvor v prehliadači

**Admin/Manažment:**

```
http://localhost:3001
```

**Výroba (bez navbaru):**

```
http://localhost:3001/production-scan
```

---

## 🧪 Test Mesačného Reportu

```bash
curl http://localhost:3002/test-monthly-report
```

**Skontroluj email:** revaj@matratex.sk

⚠️ **Potom odstráň test endpoint!**

---

## 📱 Nastavenie Výrobnej Stanice

### Pre tablet/počítač vo výrobe:

1. Zisti IP servera:

```bash
ipconfig getifaddr en0  # Mac
# alebo
hostname -I  # Linux
```

2. Na tablete otvor:

```
http://[IP_SERVERA]:3001/production-scan
```

Príklad:

```
http://192.168.1.100:3001/production-scan
```

3. (Voliteľne) Pridaj na plochu ako "appku"

---

## 🔍 Kontrola že všetko funguje

✅ Backend API: http://localhost:3002/orders  
✅ Frontend: http://localhost:3001  
✅ Dashboard: http://localhost:3001/dashboard  
✅ Výroba: http://localhost:3001/production-scan  
✅ Logy v termináli: `🚀 Server beží...`

---

## 📚 Kompletná dokumentácia

- **FINAL_SUMMARY.md** - Všetko čo bolo urobené
- **MONTHLY_REPORTS_README.md** - Mesačné reporty
- **PRODUCTION_STATION.md** - Výrobná stanica
- **NEXT_IMPROVEMENTS.md** - Ďalšie nápady

---

## ⚠️ Častá chyba

**"Cannot connect to backend"**

Riešenie:

1. Skontroluj že backend beží
2. Overte `.env.local` vo frontende: `NEXT_PUBLIC_API_URL=http://localhost:3002`
3. Reštartuj frontend

---

## ✅ Hotovo!

Systém beží a je pripravený na použitie! 🎉
