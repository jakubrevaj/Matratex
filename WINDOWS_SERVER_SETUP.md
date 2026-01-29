# 🖥️ Windows Server 2016 - Prvé nastavenie

## Požiadavky na server

- Windows Server 2016 (2026-01 Kumulativní aktualizace - KB5073722)
- Administrator prístup
- Internetové pripojenie

---

## 1. Inštalácia Node.js

1. **Stiahni Node.js LTS:**
   - Choď na https://nodejs.org/
   - Stiahni Windows Installer (.msi) - LTS verzia (20.x alebo novšia)

2. **Inštaluj Node.js:**
   - Spusti stiahnutý .msi súbor
   - Klikni "Next" cez všetky kroky
   - ✅ Zaškrtni "Automatically install the necessary tools"
   - Klikni "Install"
   - Po inštalácii reštartuj Command Prompt

3. **Overiť inštaláciu:**
   ```cmd
   node --version
   npm --version
   ```

---

## 2. Inštalácia Git

1. **Stiahni Git:**
   - Choď na https://git-scm.com/download/win
   - Stiahni Windows installer

2. **Inštaluj Git:**
   - Spusti stiahnutý .exe súbor
   - Použij default nastavenia
   - Dôležité: Vyber "Use Git from the Windows Command Prompt"

3. **Overiť inštaláciu:**
   ```cmd
   git --version
   ```

4. **Nastav Git konfiguráciu:**
   ```cmd
   git config --global user.name "Tvoje Meno"
   git config --global user.email "tvoj@email.com"
   ```

---

## 3. Inštalácia PostgreSQL

1. **Stiahni PostgreSQL:**
   - Choď na https://www.postgresql.org/download/windows/
   - Stiahni PostgreSQL 15 alebo novší

2. **Inštaluj PostgreSQL:**
   - Spusti .exe súbor
   - Nastav heslo pre postgres užívateľa: **admin**
   - Port: **5432** (default)
   - Locale: Slovak alebo English

3. **Vytvor databázu:**
   
   Otvor pgAdmin (nainštalovaný s PostgreSQL):
   - Server: localhost
   - User: postgres
   - Password: admin
   
   Vytvor novú databázu:
   - Pravý klik na "Databases" → "Create" → "Database"
   - Database name: **matratex**
   - Owner: postgres
   - Klikni "Save"

4. **Overiť:**
   ```cmd
   psql -U postgres -d matratex
   ```
   Zadaj heslo: admin

---

## 4. Inštalácia PM2

PM2 je process manager pre Node.js aplikácie.

```cmd
npm install -g pm2
npm install -g pm2-windows-startup

pm2-startup install
```

**Overiť:**
```cmd
pm2 --version
```

---

## 5. Klonovanie projektu

1. **Vytvor projektový adresár:**
   ```cmd
   cd C:\Users\revaj
   ```

2. **Klonuj repozitár:**
   ```cmd
   git clone [URL_REPOZITARA] Vyroba_program
   cd Vyroba_program
   ```

   Alebo ak už máš súbory:
   ```cmd
   cd C:\Users\revaj\Vyroba_program
   git init
   git remote add origin [URL_REPOZITARA]
   git fetch
   git checkout main
   ```

---

## 6. Konfigurácia projektu

### Backend konfigurácia

1. **Vytvor .env súbor:**
   ```cmd
   cd backend
   copy env.example .env
   ```

2. **Uprav .env:** (použij notepad alebo iný editor)
   ```cmd
   notepad .env
   ```

   Obsah:
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

### Frontend konfigurácia

1. **Vytvor .env.local:**
   ```cmd
   cd ..\frontend
   echo NEXT_PUBLIC_API_URL=http://localhost:3002 > .env.local
   ```

---

## 7. Prvé spustenie

```cmd
cd C:\Users\revaj\Vyroba_program
deploy-production.bat
```

Tento skript:
- ✅ Vytvorí potrebné priečinky
- ✅ Nainštaluje závislosti
- ✅ Zbuilduje backend aj frontend
- ✅ Spustí služby cez PM2
- ✅ Uloží PM2 konfiguráciu

---

## 8. Overiť funkčnosť

1. **Skontroluj PM2 procesy:**
   ```cmd
   pm2 list
   ```

   Očakávaný výstup:
   ```
   ┌────┬──────────────────┬─────────┬────────┐
   │ id │ name             │ status  │ restart│
   ├────┼──────────────────┼─────────┼────────┤
   │ 0  │ matratex-backend │ online  │ 0      │
   │ 1  │ matratex-frontend│ online  │ 0      │
   └────┴──────────────────┴─────────┴────────┘
   ```

2. **Skontroluj logy:**
   ```cmd
   pm2 logs --lines 50
   ```

3. **Otvor prehliadač:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3002

---

## 9. Firewall nastavenia (ak je potrebné)

Ak aplikácia nebude dostupná z iných počítačov v sieti:

```cmd
netsh advfirewall firewall add rule name="Matratex Frontend" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="Matratex Backend" dir=in action=allow protocol=TCP localport=3002
```

---

## 10. Automatický štart po reštarte servera

PM2 by malo automaticky spustiť aplikácie po reštarte. Ak nie:

1. **Vytvor Task Scheduler úlohu:**
   - Otvor Task Scheduler
   - Create Task (nie Basic Task)
   - General:
     - Name: "PM2 Resurrect"
     - ✅ Run whether user is logged on or not
     - ✅ Run with highest privileges
   - Triggers:
     - New → Begin the task: At startup
   - Actions:
     - New → Action: Start a program
     - Program: `C:\Program Files\nodejs\pm2.cmd`
     - Arguments: `resurrect`
     - Start in: `C:\Users\revaj\Vyroba_program`
   - Conditions:
     - ✅ Start only if computer is on AC power (zruš)
   - Settings:
     - ✅ Allow task to be run on demand
     - ✅ If the task is already running, do not start a new instance

2. **Test:**
   ```cmd
   pm2 save
   ```
   Potom reštartuj server a skontroluj či PM2 procesy bežia.

---

## 11. Denná údržba

### Monitoring
```cmd
pm2 monit                    # Real-time monitoring
pm2 logs                     # Logy
pm2 list                     # Status
```

### Reštart po problémoch
```cmd
pm2 restart all
```

### Aktualizácia aplikácie
```cmd
cd C:\Users\revaj\Vyroba_program
deploy-production.bat
```

---

## 12. Zálohovanie

### Databázová záloha (denná)

Vytvor batch súbor `backup-database.bat`:
```cmd
@echo off
set BACKUP_DIR=C:\Backups\Matratex
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

"C:\Program Files\PostgreSQL\15\bin\pg_dump.exe" -U postgres -d matratex > "%BACKUP_DIR%\matratex_%DATE%.sql"

echo Backup completed: matratex_%DATE%.sql
```

Nastav v Task Scheduler na denne 2:00 ráno.

---

## Riešenie problémov

### PM2 procesy sa nespúšťajú
```cmd
pm2 delete all
pm2 flush
cd backend
pm2 start ecosystem.config.js
cd ..\frontend
pm2 start ecosystem.config.js
pm2 save
```

### Port už je obsadený
```cmd
netstat -ano | findstr :3001
netstat -ano | findstr :3002
```
Zastaviť proces podľa PID:
```cmd
taskkill /PID [PID_NUMBER] /F
```

### Databáza nie je dostupná
```cmd
REM Skontroluj či PostgreSQL beží
sc query postgresql-x64-15

REM Spusti PostgreSQL
net start postgresql-x64-15

REM Test pripojenia
psql -U postgres -d matratex
```

---

## Kontakt

- **Vývojár:** Jakub Revaj
- **Email:** revaj@matratex.sk
