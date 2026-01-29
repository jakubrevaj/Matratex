# 🚀 Production Quick Start - Windows Server 2016

## Pre prvé nastavenie servera

Ak inštaluješ na nový server, postupuj podľa:
👉 **[WINDOWS_SERVER_SETUP.md](WINDOWS_SERVER_SETUP.md)**

---

## Pre aktualizáciu existujúceho servera

### Jednoduchý deployment (3 kroky)

1. **Na svojom počítači - push zmeny:**
   ```bash
   git add .
   git commit -m "Production update"
   git push origin main
   ```

2. **Na Windows Serveri - spusti deployment:**
   ```cmd
   cd C:\Users\revaj\Vyroba_program
   deploy-production.bat
   ```

3. **Skontroluj status:**
   ```cmd
   pm2 list
   pm2 logs --lines 20
   ```

**Hotovo!** 🎉

---

## Rýchle príkazy

```cmd
# Status
pm2 list                      # Všetky procesy
pm2 monit                     # Real-time monitoring

# Logy
pm2 logs                      # Všetky logy
pm2 logs matratex-backend     # Backend only
pm2 logs matratex-frontend    # Frontend only

# Reštart
pm2 restart all               # Reštartuj všetko
pm2 restart matratex-backend  # Backend only
pm2 restart matratex-frontend # Frontend only

# Stop/Start
pm2 stop all                  # Zastav všetko
pm2 start all                 # Spusti všetko
```

---

## Konfiguračné súbory

### Backend: `backend/.env`
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_DATABASE=matratex

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=

PORT=3002
NODE_ENV=production

CORS_ORIGIN=http://localhost:3001

JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=7d

OWNER_EMAIL=revaj@matratex.sk
```

### Frontend: `frontend/.env.local`
```env
# On production server (192.168.1.105)
NEXT_PUBLIC_API_URL=http://192.168.1.105:3002

# For local development
# NEXT_PUBLIC_API_URL=http://localhost:3002
```

---

## URL adresy

### Production Server (192.168.1.105)
- **Frontend:** http://192.168.1.105:3001
- **Backend API:** http://192.168.1.105:3002
- **Database:** localhost:5432 (matratex)

### Local Development
- **Frontend:** http://localhost:3000 (dev) / http://localhost:3001 (prod)
- **Backend API:** http://localhost:3002
- **Database:** localhost:5432 (matrac_system)

---

## Riešenie problémov

### Aplikácia nejde spustiť
```cmd
# 1. Skontroluj logy
pm2 logs --lines 50

# 2. Reštart s čistým buildom
cd backend
rmdir /s /q dist
npm run build
pm2 restart matratex-backend

cd ..\frontend
rmdir /s /q .next
npm run build
pm2 restart matratex-frontend
```

### Databáza nie je dostupná
```cmd
# Skontroluj či PostgreSQL beží
sc query postgresql-x64-15

# Spusti PostgreSQL
net start postgresql-x64-15

# Test pripojenia
psql -U postgres -d matratex
```

### PM2 nefunguje po reštarte servera
```cmd
pm2 save
pm2 startup
```

---

## Kompletná dokumentácia

- 📋 [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) - Krok po kroku checklist
- 🖥️ [WINDOWS_SERVER_SETUP.md](WINDOWS_SERVER_SETUP.md) - Prvé nastavenie servera
- 📖 [DEPLOYMENT_WINDOWS.md](DEPLOYMENT_WINDOWS.md) - Detailný deployment guide
- 🔧 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Všeobecný deployment guide

---

## Potrebuješ pomoc?

**Email:** revaj@matratex.sk
