# 🖱️ Cursor IDE Setup na Windows Server 2016

## Inštalácia Cursor na serveri

### 1. Stiahni Cursor

**Na serveri (192.168.1.105):**

1. Otvor prehliadač (Chrome, Edge, Firefox)
2. Choď na: https://cursor.sh/
3. Klikni na **"Download for Windows"**
4. Počkaj na stiahnutie `.exe` súboru

### 2. Nainštaluj Cursor

1. **Spusti stiahnutý súbor:** `CursorSetup-x.x.x.exe`
2. **Inštalácia:**
   - Klikni "Next" / "I Agree"
   - Vyber inštalačný priečinok (default je OK)
   - ✅ Zaškrtni: "Add to PATH"
   - ✅ Zaškrtni: "Create Desktop Icon"
   - Klikni "Install"
3. **Spusti Cursor** po dokončení inštalácie

### 3. Prvé spustenie Cursoru

1. **Prihlásenie (voliteľné):**
   - Môžeš sa prihlásiť so svojim účtom
   - Alebo pokračuj bez prihlásenia

2. **Otvor projekt:**
   - File → Open Folder
   - Naviguj na: `C:\Users\revaj\Vyroba_program`
   - Klikni "Select Folder"

---

## Čo budeme robiť v Cursore

### ✅ Checklist deployment krokov

1. **Skontrolovať aktuálny stav**
   - Pozrieť sa na git status
   - Pull najnovšie zmeny

2. **Nastaviť .env súbory**
   - `backend/.env` - produkčná databáza a CORS
   - `frontend/.env.local` - API URL s IP servera

3. **Spustiť deployment**
   - `deploy-production.bat` script
   - Alebo manuálne kroky

4. **Overiť funkčnosť**
   - PM2 status
   - Logy
   - Test v prehliadači

---

## Pripravené príkazy

Po otvorení projektu v Cursore budeš môcť spustiť tieto príkazy:

### Git

```cmd
# Aktuálny stav
git status

# Stiahnuť najnovšie zmeny
git pull origin main

# Skontrolovať poslednú verziu
git log --oneline -5
```

### Konfigurácia

```cmd
# Skontrolovať backend config
type backend\.env

# Skontrolovať frontend config
type frontend\.env.local

# Vytvoriť/upraviť .env súbory
notepad backend\.env
notepad frontend\.env.local
```

### Deployment

```cmd
# Automatický deployment (odporúčané)
deploy-production.bat

# Alebo manuálne kroky
cd backend
npm install --production
npm run build
cd ..\frontend
npm install --production
npm run build
```

### PM2

```cmd
# Status služieb
pm2 list

# Logy
pm2 logs --lines 20

# Reštart
pm2 restart all
```

---

## Potrebné .env súbory na serveri

### Backend: `C:\Users\revaj\Vyroba_program\backend\.env`

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

# CORS - DÔLEŽITÉ: IP adresa servera!
CORS_ORIGIN=http://192.168.1.105:3001

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=7d

# Owner Email
OWNER_EMAIL=revaj@matratex.sk
```

### Frontend: `C:\Users\revaj\Vyroba_program\frontend\.env.local`

```env
# Backend API - DÔLEŽITÉ: IP adresa servera!
NEXT_PUBLIC_API_URL=http://192.168.1.105:3002
```

---

## Príkazy ktoré spustíme spolu

Po otvorení Cursoru na serveri, povieš mi:
**"Cursor je nainštalovaný a projekt je otvorený"**

Potom:

1. 📥 Stiahneme najnovšie zmeny z git
2. 🔧 Nastavíme .env súbory s IP 192.168.1.105
3. 📦 Spustíme deployment script
4. ✅ Otestujeme aplikáciu

---

## Užitočné Cursor skratky

- **Ctrl + `** - Otvorí/zavrie terminál
- **Ctrl + Shift + P** - Command Palette
- **Ctrl + P** - Rýchle otváranie súborov
- **Ctrl + K + Ctrl + O** - Open Folder
- **Ctrl + /** - Komentár/Odkomentuj

---

## Čo robiť po inštalácii Cursoru

1. **Nainštaluj Cursor** na serveri
2. **Otvor projekt:** `C:\Users\revaj\Vyroba_program`
3. **Daj mi vedieť** - napíš "Cursor je pripravený"
4. **Budeme pokračovať** - pomôžem ti s každým krokom

---

## Alternatíva ak Cursor nefunguje

Ak by Cursor nefungoval na serveri, môžeme použiť:

1. **Visual Studio Code** - podobný ako Cursor
2. **Notepad++** - na úpravu .env súborov
3. **Command Prompt** - na spúšťanie príkazov

Ale Cursor je najlepšia voľba! 👍

---

## Poznámky

- Cursor je zadarmo pre základné použitie
- Funguje rovnako ako VS Code
- Má AI asistenta (ako ja) pre pomoc
- Ľahko sa používa aj na Windows Server

---

Pripravený? Nainštaluj Cursor a daj mi vedieť! 🚀
