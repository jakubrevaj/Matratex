# Matratex Production System - Setup Guide

## Požiadavky

- Node.js 18+
- PostgreSQL 12+
- npm alebo yarn

## Inštalácia

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Database Setup

Vytvorte PostgreSQL databázu:

```sql
CREATE DATABASE matrac_system;
```

### 3. Environment Variables

Skopírujte `env.example` do `.env` a vyplňte údaje:

```bash
cp env.example .env
```

Upravte `.env` súbor:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=matrac_system

# Email Configuration
EMAIL_HOST=mail.matratex.sk
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=matratex@matratex.sk
EMAIL_PASS=your_email_password

# API Configuration
API_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

### 5. Spustenie

**Backend:**

```bash
cd backend
npm run start:dev
```

**Frontend:**

```bash
cd frontend
npm run dev
```

## Bezpečnostné vylepšenia

✅ **Implementované:**

- Environment premenné namiesto hardcoded hodnôt
- CORS konfigurácia s konkrétnymi doménami
- TypeORM synchronize len pre development
- Validácia environment premenných
- TypeScript typy namiesto `any`
- Error handling s development/production režimom

## Produkčné nasadenie

1. Nastavte `NODE_ENV=production`
2. Aktualizujte CORS domény v `main.ts`
3. Použite migrácie namiesto `synchronize: true`
4. Nastavte správne databázové údaje
5. Konfigurujte email službu

## Troubleshooting

### Databáza sa nepripája

- Skontrolujte `.env` súbor
- Overte, že PostgreSQL beží
- Skontrolujte databázové údaje

### CORS chyby

- Aktualizujte CORS domény v `main.ts`
- Skontrolujte `NEXT_PUBLIC_API_URL`

### TypeScript chyby

- Spustite `npm run lint` pre detaily
- Opravte `any` typy konkrétnymi typmi

