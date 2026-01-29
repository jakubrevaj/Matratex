# 📋 Production Deployment Checklist - Windows Server 2016

## Pred nasadením na lokálnom počítači

### 1. ✅ Commit a Push zmien

```bash
git status
git add .
git commit -m "Production ready"
git push origin main
```

### 2. ✅ Test lokálne

```bash
# Spusti development servery a otestuj
cd frontend
npm run dev

cd ../backend
npm run start:dev
```

---

## Na Windows Serveri 2016

### 3. ✅ Pripoj sa na server

- Remote Desktop alebo SSH
- Otvor Command Prompt alebo PowerShell ako Administrator

### 4. ✅ Pull najnovších zmien

```cmd
cd C:\Users\revaj\Vyroba_program
git pull origin main
```

### 5. ✅ Skontroluj .env súbory

**Backend (.env):**
```cmd
cd backend
type .env
```

Skontroluj že obsahuje:
- ✅ DB_HOST=localhost
- ✅ DB_PORT=5432
- ✅ DB_USERNAME=jakubrevaj
- ✅ DB_PASSWORD=(prázdne alebo tvoje heslo)
- ✅ DB_DATABASE=matrac_system
- ✅ EMAIL_HOST=mail.matratex.sk
- ✅ EMAIL_USER=matratex@matratex.sk
- ✅ EMAIL_PASS=(skutočné heslo)
- ✅ OWNER_EMAIL=revaj@matratex.sk
- ✅ NODE_ENV=production

**Frontend (.env.local):**
```cmd
cd ..\frontend
type .env.local
```

Musí obsahovať:
```
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### 6. ✅ Vytvor PDF priečinky

```cmd
cd ..
if not exist "pdfs\dodaky" mkdir "pdfs\dodaky"
if not exist "pdfs\stitky" mkdir "pdfs\stitky"
if not exist "pdfs\prehlady" mkdir "pdfs\prehlady"
```

### 7. ✅ Spusti deployment script

```cmd
deploy-windows.bat
```

Script automaticky:
- ✅ Pull-ne zmeny z git
- ✅ Vytvorí PDF priečinky
- ✅ Nainštaluje backend závislosti
- ✅ Zbuilduje backend
- ✅ Nainštaluje frontend závislosti
- ✅ Zbuilduje frontend
- ✅ Reštartuje PM2 procesy

### 8. ✅ Skontroluj status

```cmd
pm2 list
```

Očakávaný výstup:
```
┌────┬──────────────────┬─────────┬────────┬──────────┐
│ id │ name             │ mode    │ status │ restart  │
├────┼──────────────────┼─────────┼────────┼──────────┤
│ 0  │ matratex-backend │ fork    │ online │ 0        │
│ 1  │ matratex-frontend│ fork    │ online │ 0        │
└────┴──────────────────┴─────────┴────────┴──────────┘
```

### 9. ✅ Skontroluj logy

```cmd
pm2 logs --lines 50
```

Alebo špecificky:
```cmd
pm2 logs matratex-backend --lines 20
pm2 logs matratex-frontend --lines 20
```

### 10. ✅ Test aplikácie

Otvor prehliadač:
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3002

Test funkcionality:
- ✅ Prihlásenie funguje
- ✅ Objednávky sa zobrazujú
- ✅ PDF sa generujú
- ✅ Email sa odosiela (test)

---

## Monitoring a údržba

### Denné kontroly

```cmd
pm2 list                           # Status procesov
pm2 logs --lines 100               # Posledné logy
```

### Týždenné kontroly

```cmd
pm2 monit                          # Real-time monitoring
dir pdfs\stitky                    # Skontroluj PDF súbory
dir pdfs\prehlady
dir pdfs\dodaky
```

### Mesačné zálohy

```cmd
REM Záloha databázy
pg_dump -U jakubrevaj -d matrac_system > backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql

REM Záloha PDF súborov
xcopy /E /I pdfs pdfs_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%
```

---

## Riešenie problémov

### Backend sa nespustí

1. **Skontroluj logy:**
   ```cmd
   pm2 logs matratex-backend --lines 100
   ```

2. **Skontroluj databázu:**
   ```cmd
   netstat -ano | findstr :5432
   ```

3. **Reštart s čistým buildom:**
   ```cmd
   cd backend
   rmdir /s /q dist
   rmdir /s /q node_modules
   npm install --production
   npm run build
   pm2 restart matratex-backend
   ```

### Frontend sa nespustí

1. **Skontroluj logy:**
   ```cmd
   pm2 logs matratex-frontend --lines 100
   ```

2. **Rebuild:**
   ```cmd
   cd frontend
   rmdir /s /q .next
   npm run build
   pm2 restart matratex-frontend
   ```

### PM2 sa nespustí po reštarte Windows

1. **Ulož PM2 konfiguráciu:**
   ```cmd
   pm2 save
   ```

2. **Nastav PM2 startup:**
   ```cmd
   pm2 startup
   ```

3. **Alebo vytvor Task Scheduler task:**
   - Task Scheduler → Create Basic Task
   - Name: "PM2 Resurrect"
   - Trigger: "When the computer starts"
   - Action: "Start a program"
   - Program: `C:\Program Files\nodejs\pm2.cmd`
   - Arguments: `resurrect`
   - User: Tvoj užívateľ
   - Run with highest privileges

---

## Aktualizácia po zmenách

### Rýchla aktualizácia (bez zmien v dependencies)

```cmd
cd C:\Users\revaj\Vyroba_program
git pull origin main

cd backend
npm run build
pm2 restart matratex-backend

cd ..\frontend
npm run build
pm2 restart matratex-frontend
```

### Plná aktualizácia (so zmenami v dependencies)

```cmd
cd C:\Users\revaj\Vyroba_program
deploy-windows.bat
```

---

## Užitočné príkazy

```cmd
REM PM2
pm2 list                          # Zoznam procesov
pm2 logs                          # Všetky logy
pm2 monit                         # Real-time monitoring
pm2 restart all                   # Reštart všetkého
pm2 stop all                      # Zastaviť všetko
pm2 delete all                    # Vymazať všetko z PM2
pm2 save                          # Uložiť konfiguráciu

REM Git
git status                        # Aktuálny stav
git pull origin main              # Stiahnuť zmeny
git log --oneline -10             # Posledných 10 commitov

REM PostgreSQL
psql -U jakubrevaj -d matrac_system   # Pripojiť sa k DB
pg_dump -U jakubrevaj -d matrac_system > backup.sql   # Záloha DB

REM Network
netstat -ano | findstr :3001      # Frontend port
netstat -ano | findstr :3002      # Backend port
netstat -ano | findstr :5432      # PostgreSQL port
```

---

## Kontakty

- **Developer:** Jakub Revaj
- **Email:** revaj@matratex.sk
- **Repository:** [Git repo URL]

---

## História zmien

| Dátum | Verzia | Zmeny |
|-------|--------|-------|
| 2026-01-29 | 1.0 | Prvé produkčné nasadenie |
