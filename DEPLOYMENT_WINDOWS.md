# 🚀 Deployment Guide - Windows Server

## Rýchly deployment

### Automatický (odporúčané)

1. **Push zmeny na git:**

```bash
git add .
git commit -m "Update message"
git push origin main
```

2. **Na serveri spusti deployment script:**

```cmd
cd C:\path\to\Vyroba_program
deploy-windows.bat
```

---

## Manuálny deployment

### 1. Pull zmeny z git

```cmd
cd C:\Users\revaj\Vyroba_program
git pull origin main
```

### 2. Backend

```cmd
cd backend
npm install --production
npm run build
cd ..
```

### 3. Frontend

```cmd
cd frontend
npm install --production
npm run build
cd ..
```

### 4. Restart PM2 služieb

```cmd
pm2 restart backend
pm2 restart frontend
pm2 save
```

---

## Užitočné PM2 príkazy

### Monitoring

```cmd
pm2 list              # Zoznam služieb
pm2 monit             # Real-time monitoring
pm2 logs              # Všetky logy
pm2 logs backend      # Backend logy
pm2 logs frontend     # Frontend logy
```

### Reštart

```cmd
pm2 restart backend   # Reštart backend
pm2 restart frontend  # Reštart frontend
pm2 restart all       # Reštart všetkého
```

### Info

```cmd
pm2 show backend      # Detaily o backend
pm2 show frontend     # Detaily o frontend
```

### Stop/Start

```cmd
pm2 stop backend      # Zastaviť backend
pm2 start backend     # Spustiť backend
pm2 delete backend    # Odstrániť z PM2
```

---

## Riešenie problémov

### Backend sa nespustí

1. **Skontroluj logy:**

```cmd
pm2 logs backend --lines 100
```

2. **Skontroluj či beží databáza:**

```cmd
# PostgreSQL by mal bežať ako služba
# Services -> PostgreSQL
```

3. **Skontroluj port:**

```cmd
netstat -ano | findstr :3002
```

4. **Reštart s čistým buildom:**

```cmd
cd backend
rmdir /s /q dist
rmdir /s /q node_modules
npm install
npm run build
pm2 restart backend
```

### Frontend sa nespustí

1. **Skontroluj logy:**

```cmd
pm2 logs frontend --lines 100
```

2. **Rebuild:**

```cmd
cd frontend
rmdir /s /q .next
rmdir /s /q node_modules
npm install
npm run build
pm2 restart frontend
```

### PDF sa negenerujú

1. **Skontroluj foldery:**

```cmd
dir pdfs
dir pdfs\dodaky
dir pdfs\stitky
dir pdfs\prehlady
```

2. **Vytvor ak chýbajú:**

```cmd
mkdir pdfs\dodaky
mkdir pdfs\stitky
mkdir pdfs\prehlady
```

### Databázové chyby

1. **Skontroluj .env súbor:**

```cmd
cd backend
type .env
```

2. **Testuj pripojenie:**

```cmd
psql -U your_username -d matrac_system -h localhost
```

---

## Environment Variables

**Backend `.env`:**

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=matrac_system

EMAIL_HOST=mail.matratex.sk
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=matratex@matratex.sk
EMAIL_PASS=your_email_password
```

**Frontend `.env.local`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

---

## PM2 Startup (Windows)

Aby sa PM2 spustilo automaticky po reštarte Windows:

1. **Vytvor startup task:**

```cmd
pm2 startup
```

2. **Ulož aktuálnu konfiguráciu:**

```cmd
pm2 save
```

3. **Alebo manuálne vytvor Task Scheduler task:**
   - Otvor Task Scheduler
   - Create Basic Task
   - Name: "PM2 Startup"
   - Trigger: "When the computer starts"
   - Action: "Start a program"
   - Program: `C:\Program Files\nodejs\pm2.cmd`
   - Arguments: `resurrect`

---

## Zálohovanie

### Databáza

```cmd
pg_dump -U your_username -d matrac_system > backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql
```

### Celý projekt (bez node_modules)

```cmd
xcopy /E /I /EXCLUDE:exclude.txt Vyroba_program Vyroba_program_backup
```

---

## Aktuálny stav služieb

```
┌────┬──────────┬─────────┬────────┬──────────┐
│ id │ name     │ mode    │ status │ restart  │
├────┼──────────┼─────────┼────────┼──────────┤
│ 0  │ backend  │ fork    │ online │ 102      │
│ 1  │ frontend │ fork    │ online │ 0        │
└────┴──────────┴─────────┴────────┴──────────┘
```

**Poznámka:** Backend má 102 reštartov - skontroluj logy prečo:

```cmd
pm2 logs backend --lines 200
```
