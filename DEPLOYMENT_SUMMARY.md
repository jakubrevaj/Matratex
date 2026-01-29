# 📦 Deployment Summary - Production Ready

**Dátum prípravy:** 29. January 2026  
**Cieľový server:** Windows Server 2016 (KB5073722)  
**Stav:** ✅ Pripravené na deployment

---

## 🎯 Čo je pripravené

### ✅ Konfiguračné súbory

1. **backend/.env** - Produkčná konfigurácia databázy a emailu
2. **frontend/.env.local** - Správny API endpoint
3. **backend/ecosystem.config.js** - PM2 konfigurácia pre backend
4. **frontend/ecosystem.config.js** - PM2 konfigurácia pre frontend

### ✅ Deployment skripty

1. **deploy-production.bat** - Hlavný deployment skript (kompletný)
2. **deploy-windows.bat** - Rýchly deployment skript
3. **start-production.bat** - Štart produkčných služieb
4. **setup-database.bat** - Databázová konfigurácia

### ✅ Dokumentácia

1. **PRODUCTION_QUICK_START.md** - Rýchly návod (3 kroky)
2. **PRODUCTION_CHECKLIST.md** - Detailný checklist
3. **WINDOWS_SERVER_SETUP.md** - Prvé nastavenie servera od nuly
4. **DEPLOYMENT_WINDOWS.md** - Windows deployment guide
5. **DEPLOYMENT_GUIDE.md** - Všeobecný deployment guide

---

## 🔧 Produkčná konfigurácia

### Databáza
- **Host:** localhost
- **Port:** 5432
- **Database:** matratex
- **Username:** postgres
- **Password:** admin

### Aplikácia
- **Frontend:** http://localhost:3001
- **Backend:** http://localhost:3002
- **Environment:** production

### Email (pripravené pre konfiguráciu)
- **Host:** smtp.gmail.com
- **Port:** 587
- **Secure:** false
- **User:** (nastaviť)
- **Password:** (nastaviť)

---

## 📋 Deployment kroky na serveri

### Prvé nasadenie (nový server)

1. **Inštaluj požiadavky:**
   - Node.js 20.x LTS
   - Git
   - PostgreSQL 15+
   - PM2 (globálne)

2. **Klonuj projekt:**
   ```cmd
   git clone [URL] C:\Users\revaj\Vyroba_program
   cd C:\Users\revaj\Vyroba_program
   ```

3. **Vytvor databázu:**
   ```cmd
   psql -U postgres
   CREATE DATABASE matratex;
   \q
   ```

4. **Spusti deployment:**
   ```cmd
   deploy-production.bat
   ```

### Aktualizácia existujúceho servera

```cmd
cd C:\Users\revaj\Vyroba_program
git pull origin main
deploy-production.bat
```

---

## ✨ Nové funkcie v tejto verzii

1. **Opravený .env konfigurácia** - DB_PASSWORD je teraz optional
2. **PM2 ecosystem súbory** - Pre obe aplikácie (backend + frontend)
3. **Kompletné deployment skripty** - Automatizované buildy a reštarty
4. **Produkčná dokumentácia** - 5 dokumentov pokrývajúcich všetky scenáre

---

## 🔍 Čo skontrolovať po deployment

### 1. PM2 Procesy
```cmd
pm2 list
```
Očakávané:
- ✅ matratex-backend - status: online
- ✅ matratex-frontend - status: online

### 2. Logy
```cmd
pm2 logs --lines 20
```
Očakávané:
- ✅ Backend: "Server beží na http://localhost:3002"
- ✅ Frontend: "Ready in XXXms"
- ❌ Žiadne error messages

### 3. Webové rozhranie
- Frontend: http://localhost:3001 - ✅ Aplikácia sa načíta
- Backend API: http://localhost:3002 - ✅ API odpovedá

### 4. Databázové pripojenie
```cmd
pm2 logs matratex-backend --lines 10
```
Hľadaj: "Database connection successful" alebo podobnú správu

### 5. PDF priečinky
```cmd
dir pdfs
```
Očakávané:
- ✅ pdfs\dodaky
- ✅ pdfs\stitky
- ✅ pdfs\prehlady

---

## 🆘 Riešenie bežných problémov

### Backend sa nespúšťa
**Príčina:** Databáza nie je dostupná
```cmd
net start postgresql-x64-15
pm2 restart matratex-backend
```

### Frontend error "Cannot connect to API"
**Príčina:** Backend nebeží alebo zlá .env.local konfigurácia
```cmd
pm2 restart matratex-backend
# Skontroluj frontend/.env.local
type frontend\.env.local
```

### PM2 procesy sa reštartujú neustále
**Príčina:** Chyba v kóde alebo konfigurácii
```cmd
pm2 logs --lines 50
# Oprav problém a znovu buildni
cd backend
npm run build
pm2 restart matratex-backend
```

### Port už je obsadený
```cmd
netstat -ano | findstr :3001
netstat -ano | findstr :3002
# Zastaviť proces podľa PID
taskkill /PID [PID] /F
pm2 restart all
```

---

## 📞 Kontakt a podpora

- **Vývojár:** Jakub Revaj
- **Email:** revaj@matratex.sk
- **Projekt:** Matratex - Výrobný systém

---

## 📝 História verzií

| Verzia | Dátum | Zmeny |
|--------|-------|-------|
| 1.0 | 2026-01-29 | Prvá produkčná verzia pripravená pre deployment |

---

## ⚠️ Dôležité poznámky

1. **Email konfigurácia** - Je potrebné doplniť skutočné prihlasovacie údaje v `backend/.env`
2. **JWT Secret** - Zmeň `JWT_SECRET` na náhodný silný string
3. **Zálohovanie** - Nastav pravidelné zálohy databázy (odporúčané denne)
4. **PM2 Startup** - Po prvom deployment nastav PM2 startup pre automatický štart po reštarte
5. **Firewall** - Ak bude potrebný prístup z iných počítačov, otvor porty 3001 a 3002

---

## ✅ Deployment Checklist

Pred spustením na serveri skontroluj:

- [ ] Node.js nainštalovaný (verzia 20.x+)
- [ ] Git nainštalovaný
- [ ] PostgreSQL nainštalovaný a beží
- [ ] PM2 nainštalovaný globálne
- [ ] Databáza "matratex" vytvorená
- [ ] Projekt naklonovaný/nakopírovaný
- [ ] backend/.env súbor existuje a je správne vyplnený
- [ ] frontend/.env.local súbor existuje
- [ ] Priečinky pdfs/* vytvorené
- [ ] Deploy skript deploy-production.bat spustený
- [ ] PM2 procesy bežia (pm2 list)
- [ ] Frontend dostupný na http://localhost:3001
- [ ] Backend dostupný na http://localhost:3002
- [ ] Logy neobsahujú kritické chyby (pm2 logs)
- [ ] PM2 startup nakonfigurovaný (pm2 save, pm2 startup)

---

**Status:** ✅ Pripravené na deployment  
**Nasledujúci krok:** Spusti `deploy-production.bat` na Windows Serveri
