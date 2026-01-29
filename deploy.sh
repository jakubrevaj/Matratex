#!/bin/bash

# Matratex Production Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting Matratex deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes from git...${NC}"
git pull origin main

# 2. Create PDF directories
echo -e "${YELLOW}📁 Creating PDF directories...${NC}"
mkdir -p pdfs/dodaky
mkdir -p pdfs/stitky
mkdir -p pdfs/prehlady

# 3. Backend
echo -e "${YELLOW}🔧 Building backend...${NC}"
cd backend
npm install --production
npm run build
cd ..

# 4. Frontend
echo -e "${YELLOW}⚛️  Building frontend...${NC}"
cd frontend
npm install --production
npm run build
cd ..

# 5. Restart services (PM2)
if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}🔄 Restarting PM2 services...${NC}"
    pm2 restart matratex-backend || pm2 start backend/dist/main.js --name matratex-backend
    pm2 restart matratex-frontend || (cd frontend && pm2 start npm --name matratex-frontend -- start)
    pm2 save
elif command -v systemctl &> /dev/null; then
    echo -e "${YELLOW}🔄 Restarting systemd services...${NC}"
    sudo systemctl restart matratex-backend
    sudo systemctl restart matratex-frontend
else
    echo -e "${YELLOW}⚠️  No process manager found. Please start services manually.${NC}"
fi

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Check backend: curl http://localhost:3002/health"
echo "2. Check frontend: curl http://localhost:3000"
echo "3. Monitor logs: pm2 logs (or journalctl -u matratex-backend -f)"
