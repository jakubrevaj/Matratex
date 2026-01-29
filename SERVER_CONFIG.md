# 🖥️ Konfigurácia pre Production Server

**Server IP:** 192.168.1.105  
**Frontend:** http://192.168.1.105:3001  
**Backend:** http://192.168.1.105:3002

---

## Nastavenie .env súborov na serveri

### 1. Backend: `C:\Users\revaj\Vyroba_program\backend\.env`

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_DATABASE=matratex

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=

# Server Configuration
PORT=3002
NODE_ENV=production

# CORS - Frontend address
CORS_ORIGIN=http://192.168.1.105:3001

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d

# Owner Email
OWNER_EMAIL=revaj@matratex.sk
```

### 2. Frontend: `C:\Users\revaj\Vyroba_program\frontend\.env.local`

```env
# Backend API URL on production server
NEXT_PUBLIC_API_URL=http://192.168.1.105:3002
```

---

## Deployment na server (192.168.1.105)

### Jednoduchý deployment

1. **Pripoj sa na server:**
   - Remote Desktop → 192.168.1.105
   - Alebo SSH (ak je nastavené)

2. **Spusti deployment script:**
   ```cmd
   cd C:\Users\revaj\Vyroba_program
   deploy-production.bat
   ```

3. **Skontroluj status:**
   ```cmd
   pm2 list
   ```

### Manuálny deployment

```cmd
cd C:\Users\revaj\Vyroba_program

REM Pull zmeny
git pull origin main

REM Backend
cd backend
npm install --production
npm run build
pm2 restart matratex-backend

REM Frontend
cd ..\frontend
npm install --production
npm run build
pm2 restart matratex-frontend

REM Ulož PM2
pm2 save
```

---

## Prístup k aplikácii

### Z lokálnej siete (rovnaká sieť ako server)
- **Frontend:** http://192.168.1.105:3001
- **Backend API:** http://192.168.1.105:3002

### Z iných počítačov

1. **Windows Firewall:** Povoľ porty 3001 a 3002
   ```cmd
   netsh advfirewall firewall add rule name="Matratex Frontend" dir=in action=allow protocol=TCP localport=3001
   netsh advfirewall firewall add rule name="Matratex Backend" dir=in action=allow protocol=TCP localport=3002
   ```

2. **Otestuj z iného počítača:**
   - Otvor prehliadač
   - Zadaj: http://192.168.1.105:3001

---

## Monitoring na serveri

### PM2 príkazy

```cmd
REM Status všetkých služieb
pm2 list

REM Real-time monitoring
pm2 monit

REM Logy
pm2 logs
pm2 logs matratex-backend
pm2 logs matratex-frontend

REM Reštart
pm2 restart all
pm2 restart matratex-backend
pm2 restart matratex-frontend
```

### Kontrola portov

```cmd
REM Skontroluj či porty sú otvorené
netstat -ano | findstr :3001
netstat -ano | findstr :3002
netstat -ano | findstr :5432
```

---

## Riešenie problémov

### Frontend sa nenačíta (http://192.168.1.105:3001)

1. **Skontroluj PM2:**
   ```cmd
   pm2 list
   pm2 logs matratex-frontend --lines 20
   ```

2. **Skontroluj .env.local:**
   ```cmd
   cd C:\Users\revaj\Vyroba_program\frontend
   type .env.local
   ```
   Musí obsahovať: `NEXT_PUBLIC_API_URL=http://192.168.1.105:3002`

3. **Reštart:**
   ```cmd
   pm2 restart matratex-frontend
   ```

### Backend nedostupný (http://192.168.1.105:3002)

1. **Skontroluj PM2:**
   ```cmd
   pm2 logs matratex-backend --lines 20
   ```

2. **Skontroluj databázu:**
   ```cmd
   sc query postgresql-x64-15
   net start postgresql-x64-15
   ```

3. **Skontroluj .env:**
   ```cmd
   cd C:\Users\revaj\Vyroba_program\backend
   type .env
   ```

### API chyby "Cannot connect" na frontende

**Príčina:** Frontend sa pokúša pripojiť na zlú adresu

**Riešenie:**
```cmd
cd C:\Users\revaj\Vyroba_program\frontend
echo NEXT_PUBLIC_API_URL=http://192.168.1.105:3002 > .env.local
npm run build
pm2 restart matratex-frontend
```

### Z iného počítača nie je prístup

1. **Skontroluj Windows Firewall:**
   ```cmd
   netsh advfirewall firewall show rule name="Matratex Frontend"
   netsh advfirewall firewall show rule name="Matratex Backend"
   ```

2. **Ak pravidlá neexistujú, pridaj ich:**
   ```cmd
   netsh advfirewall firewall add rule name="Matratex Frontend" dir=in action=allow protocol=TCP localport=3001
   netsh advfirewall firewall add rule name="Matratex Backend" dir=in action=allow protocol=TCP localport=3002
   ```

3. **Skontroluj IP adresu servera:**
   ```cmd
   ipconfig
   ```
   Nájdi IPv4 Address pre tvoju sieťovú kartu (malo by byť 192.168.1.105)

---

## Bezpečnosť

### Produkčné odporúčania

1. **Zmeň JWT_SECRET:**
   ```cmd
   cd C:\Users\revaj\Vyroba_program\backend
   notepad .env
   ```
   Zmeň `JWT_SECRET` na náhodný dlhý string

2. **Databázové heslo:**
   - Aktuálne: `admin`
   - Zmeň na silnejšie heslo v PostgreSQL a v `.env`

3. **Email konfigurácia:**
   - Doplň skutočné prihlasovacie údaje pre email

4. **Firewall:**
   - Povoľ porty len pre potrebné IP adresy (nie celý internet)

---

## Zálohovanie

### Databázová záloha

```cmd
cd C:\Backups\Matratex
"C:\Program Files\PostgreSQL\15\bin\pg_dump.exe" -U postgres -d matratex > matratex_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql
```

### Automatická záloha

Vytvor Task Scheduler úlohu:
- Trigger: Denne 2:00 AM
- Action: Spusti backup script
- User: Tvoj admin účet

---

## Aktualizácia z lokálneho počítača

### 1. Lokálne - Push zmeny

```bash
git add .
git commit -m "Update message"
git push origin main
```

### 2. Na serveri - Pull a deploy

```cmd
cd C:\Users\revaj\Vyroba_program
deploy-production.bat
```

---

## Kontakt

- **Server IP:** 192.168.1.105
- **Administrátor:** Jakub Revaj
- **Email:** revaj@matratex.sk
