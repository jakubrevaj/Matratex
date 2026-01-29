# ✅ Deployment Checklist - Budeme to robiť spolu!

**Server:** Windows Server 2016 (192.168.1.105)  
**Cursor:** Nainštalovaný a projekt otvorený

---

## 1️⃣ Prvé kroky v Cursore

### Otvor terminál
- Stlač: **Ctrl + `** (backtick)
- Alebo: Terminal → New Terminal

### Skontroluj aktuálny priečinok
```cmd
cd
```
Malo by ukázať: `C:\Users\revaj\Vyroba_program`

Ak nie, prejdi tam:
```cmd
cd C:\Users\revaj\Vyroba_program
```

---

## 2️⃣ Git - Stiahnuť najnovšie zmeny

```cmd
git status
```
✅ Skontroluj či sú nejaké lokálne zmeny

```cmd
git pull origin main
```
✅ Stiahne najnovšie zmeny z GitHubu

---

## 3️⃣ Nastavenie Backend .env

### Otvor súbor
V Cursore:
- Ctrl + P
- Napíš: `backend/.env`
- Enter

### Obsah (skontroluj/uprav):
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

CORS_ORIGIN=http://192.168.1.105:3001

JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=7d

OWNER_EMAIL=revaj@matratex.sk
```

**DÔLEŽITÉ:** 
- ✅ `CORS_ORIGIN=http://192.168.1.105:3001` (IP servera!)
- ✅ `DB_PASSWORD=admin`
- ✅ `NODE_ENV=production`

### Ulož súbor
- Ctrl + S

---

## 4️⃣ Nastavenie Frontend .env.local

### Otvor súbor
V Cursore:
- Ctrl + P
- Napíš: `frontend/.env.local`
- Enter

### Obsah (presne takto):
```env
NEXT_PUBLIC_API_URL=http://192.168.1.105:3002
```

**DÔLEŽITÉ:** IP adresa servera, nie localhost!

### Ulož súbor
- Ctrl + S

---

## 5️⃣ Skontroluj PostgreSQL

```cmd
sc query postgresql-x64-15
```

Ak nie je spustená:
```cmd
net start postgresql-x64-15
```

Test pripojenia:
```cmd
psql -U postgres -d matratex
```
(zadaj heslo: admin)

V psql konzole:
```sql
\dt
\q
```

---

## 6️⃣ Vytvor potrebné priečinky

```cmd
if not exist "pdfs\dodaky" mkdir "pdfs\dodaky"
if not exist "pdfs\stitky" mkdir "pdfs\stitky"
if not exist "pdfs\prehlady" mkdir "pdfs\prehlady"
if not exist "backend\logs" mkdir "backend\logs"
if not exist "frontend\logs" mkdir "frontend\logs"
```

---

## 7️⃣ Deployment - Backend

```cmd
cd backend
```

### Inštaluj závislosti
```cmd
npm install --production
```
⏱️ Počkaj 1-2 minúty

### Build
```cmd
npm run build
```
⏱️ Počkaj 30-60 sekúnd

### Späť do root
```cmd
cd ..
```

---

## 8️⃣ Deployment - Frontend

```cmd
cd frontend
```

### Inštaluj závislosti
```cmd
npm install --production
```
⏱️ Počkaj 1-2 minúty

### Build
```cmd
npm run build
```
⏱️ Počkaj 2-3 minúty (môže byť dlhšie)

### Späť do root
```cmd
cd ..
```

---

## 9️⃣ PM2 - Spustenie služieb

### Skontroluj či PM2 existujúce procesy
```cmd
pm2 list
```

### Ak existujú, reštartuj ich
```cmd
pm2 restart matratex-backend
pm2 restart matratex-frontend
```

### Ak neexistujú, spusti ich
```cmd
cd backend
pm2 start ecosystem.config.js
cd ..\frontend
pm2 start ecosystem.config.js
cd ..
```

### Ulož PM2 konfiguráciu
```cmd
pm2 save
```

---

## 🔟 Overiť funkčnosť

### PM2 Status
```cmd
pm2 list
```
Očakávané:
- ✅ matratex-backend - status: **online**
- ✅ matratex-frontend - status: **online**

### Logy
```cmd
pm2 logs --lines 20
```

Hľadaj:
- ✅ Backend: "Server beží na http://localhost:3002"
- ✅ Frontend: "Ready in XXXms"
- ❌ Žiadne ERROR správy

### Test v prehliadači

Otvor prehliadač na serveri:
- Frontend: http://192.168.1.105:3001
- Backend API: http://192.168.1.105:3002

Z iného počítača v sieti:
- http://192.168.1.105:3001

---

## 🎯 Firewall (ak je potrebné)

Ak aplikácia nie je dostupná z iných počítačov:

```cmd
netsh advfirewall firewall add rule name="Matratex Frontend" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="Matratex Backend" dir=in action=allow protocol=TCP localport=3002
```

---

## 🆘 Ak niečo nejde

### Backend sa nespúšťa

1. Pozri logy:
```cmd
pm2 logs matratex-backend --lines 50
```

2. Skontroluj .env:
```cmd
type backend\.env
```

3. Skontroluj databázu:
```cmd
sc query postgresql-x64-15
psql -U postgres -d matratex
```

### Frontend sa nespúšťa

1. Pozri logy:
```cmd
pm2 logs matratex-frontend --lines 50
```

2. Skontroluj .env.local:
```cmd
type frontend\.env.local
```

3. Rebuild:
```cmd
cd frontend
rmdir /s /q .next
npm run build
pm2 restart matratex-frontend
cd ..
```

### PM2 procesy sa reštartujú

1. Logy:
```cmd
pm2 logs --lines 100
```

2. Vymaž a spusti znova:
```cmd
pm2 delete all
pm2 flush
cd backend
pm2 start ecosystem.config.js
cd ..\frontend
pm2 start ecosystem.config.js
pm2 save
```

---

## ✅ Hotovo!

Ak všetko funguje:
- ✅ PM2 procesy online
- ✅ Žiadne errory v logoch
- ✅ Frontend dostupný na http://192.168.1.105:3001
- ✅ Aplikácia funguje správne

---

## 📝 Poznámky

Po každej zmene kódu (git pull):
```cmd
deploy-production.bat
```

Alebo manuálne:
```cmd
cd backend
npm install --production
npm run build
pm2 restart matratex-backend

cd ..\frontend
npm install --production
npm run build
pm2 restart matratex-frontend
```

---

**Spolu to zvládneme!** 💪

Budem ti pomáhať s každým krokom cez Cursor na serveri.
