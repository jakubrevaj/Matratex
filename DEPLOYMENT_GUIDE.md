# 🚀 Deployment Guide - Matratex Production System

## Pred nasadením

### 1. Commit a Push všetkých zmien

```bash
# V root projekte
git status
git add .
git commit -m "Production ready: discount fix, custom delivery items, PDF organization"
git push origin main
```

## Nasadenie na server

### 2. Pripojenie na server

```bash
ssh your_user@your_server_ip
```

### 3. Pull zmien z git

```bash
cd /path/to/Vyroba_program
git pull origin main
```

### 4. Inštalácia/Update dependencies

```bash
# Backend
cd backend
npm install --production
cd ..

# Frontend
cd frontend
npm install --production
cd ..
```

### 5. Build aplikácie

```bash
# Backend (TypeScript → JavaScript)
cd backend
npm run build
cd ..

# Frontend (Next.js)
cd frontend
npm run build
cd ..
```

### 6. Environment Variables

Skontroluj že máš správne nastavené `.env` súbory:

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

### 7. Vytvorenie PDF folderov

```bash
# Vytvor foldery pre PDF súbory
mkdir -p pdfs/dodaky
mkdir -p pdfs/stitky
mkdir -p pdfs/prehlady
```

### 8. Reštart služieb

#### Ak používaš PM2:

```bash
# Zastaviť existujúce procesy
pm2 stop all

# Backend
cd backend
pm2 start npm --name "matratex-backend" -- run start:prod

# Frontend
cd ../frontend
pm2 start npm --name "matratex-frontend" -- start

# Uložiť konfiguráciu
pm2 save
pm2 startup
```

#### Ak používaš systemd:

**Backend service** (`/etc/systemd/system/matratex-backend.service`):

```ini
[Unit]
Description=Matratex Backend
After=network.target postgresql.service

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/Vyroba_program/backend
ExecStart=/usr/bin/npm run start:prod
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

**Frontend service** (`/etc/systemd/system/matratex-frontend.service`):

```ini
[Unit]
Description=Matratex Frontend
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/Vyroba_program/frontend
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
# Reštart služieb
sudo systemctl daemon-reload
sudo systemctl restart matratex-backend
sudo systemctl restart matratex-frontend

# Povoliť autostart
sudo systemctl enable matratex-backend
sudo systemctl enable matratex-frontend

# Skontrolovať status
sudo systemctl status matratex-backend
sudo systemctl status matratex-frontend
```

### 9. Nginx konfigurácia (ak používaš)

**/etc/nginx/sites-available/matratex:**

```nginx
server {
    listen 80;
    server_name your_domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # PDF súbory (statické)
    location /pdfs {
        alias /path/to/Vyroba_program/pdfs;
        autoindex off;
    }
}
```

```bash
# Aktivovať konfiguráciu
sudo ln -s /etc/nginx/sites-available/matratex /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 10. Databázové migrácie (ak sú potrebné)

```bash
cd backend
npm run typeorm migration:run
```

### 11. Testovanie

```bash
# Skontroluj či backend beží
curl http://localhost:3002/health

# Skontroluj či frontend beží
curl http://localhost:3000

# Skontroluj logy
# PM2:
pm2 logs matratex-backend
pm2 logs matratex-frontend

# systemd:
sudo journalctl -u matratex-backend -f
sudo journalctl -u matratex-frontend -f
```

## Monitoring

### PM2 Monitoring

```bash
pm2 monit
pm2 list
pm2 logs
```

### systemd Monitoring

```bash
sudo systemctl status matratex-backend
sudo systemctl status matratex-frontend
sudo journalctl -u matratex-backend --since today
```

## Riešenie problémov

### Backend sa nespustí

```bash
# Skontroluj logy
pm2 logs matratex-backend --lines 100
# alebo
sudo journalctl -u matratex-backend -n 100

# Skontroluj či beží databáza
sudo systemctl status postgresql

# Skontroluj port
netstat -tlnp | grep 3002
```

### Frontend sa nespustí

```bash
# Skontroluj logy
pm2 logs matratex-frontend --lines 100

# Rebuild frontend
cd frontend
rm -rf .next
npm run build
pm2 restart matratex-frontend
```

### PDF sa negenerujú

```bash
# Skontroluj či existujú foldery
ls -la pdfs/
ls -la pdfs/dodaky/
ls -la pdfs/stitky/
ls -la pdfs/prehlady/

# Skontroluj práva
chmod -R 755 pdfs/
```

## Bezpečnostné odporúčania

1. **Firewall**: Povoľ len potrebné porty (80, 443, SSH)
2. **SSL/TLS**: Použi Let's Encrypt pre HTTPS
3. **Database**: Zabezpeč PostgreSQL prístup
4. **Zálohování**: Nastav automatické zálohy databázy
5. **Updates**: Pravidelne aktualizuj závislosti

## Rýchly reštart po zmenách

```bash
# Na serveri
cd /path/to/Vyroba_program
git pull origin main

# Backend
cd backend
npm install --production
npm run build
pm2 restart matratex-backend
# alebo: sudo systemctl restart matratex-backend

# Frontend
cd ../frontend
npm install --production
npm run build
pm2 restart matratex-frontend
# alebo: sudo systemctl restart matratex-frontend
```

## Kontakt a podpora

- GitHub: [link-to-repo]
- Email: support@matratex.sk
