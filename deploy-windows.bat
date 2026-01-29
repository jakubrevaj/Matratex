@echo off
REM Matratex Production Deployment Script for Windows
REM Usage: deploy-windows.bat

echo.
echo ========================================
echo   MATRATEX DEPLOYMENT
echo ========================================
echo.

REM 1. Pull latest changes
echo [1/6] Pulling latest changes from git...
git pull origin main
if %errorlevel% neq 0 (
    echo ERROR: Git pull failed!
    pause
    exit /b 1
)

REM 2. Create PDF directories
echo [2/6] Creating PDF directories...
if not exist "pdfs\dodaky" mkdir "pdfs\dodaky"
if not exist "pdfs\stitky" mkdir "pdfs\stitky"
if not exist "pdfs\prehlady" mkdir "pdfs\prehlady"

REM 3. Backend
echo [3/6] Installing backend dependencies...
cd backend
call npm install --production
if %errorlevel% neq 0 (
    echo ERROR: Backend npm install failed!
    cd ..
    pause
    exit /b 1
)

echo [4/6] Building backend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Backend build failed!
    cd ..
    pause
    exit /b 1
)
cd ..

REM 4. Frontend
echo [5/6] Installing and building frontend...
cd frontend
call npm install --production
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    cd ..
    pause
    exit /b 1
)
cd ..

REM 5. Restart PM2 services
echo [6/6] Restarting PM2 services...
call pm2 restart backend
call pm2 restart frontend
call pm2 save

echo.
echo ========================================
echo   DEPLOYMENT COMPLETED!
echo ========================================
echo.
echo Next steps:
echo 1. Check status: pm2 list
echo 2. Check logs: pm2 logs backend
echo 3. Monitor: pm2 monit
echo.
pause
