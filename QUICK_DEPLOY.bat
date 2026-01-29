@echo off
REM Quick Deploy - Use this for fast updates without reinstalling dependencies
echo.
echo ========================================
echo   MATRATEX - QUICK DEPLOY
echo ========================================
echo.

REM 1. Pull changes
echo [1/5] Pulling latest changes...
git pull origin main
if %errorlevel% neq 0 (
    echo ERROR: Git pull failed!
    pause
    exit /b 1
)

REM 2. Backend build
echo [2/5] Building backend...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Backend build failed!
    cd ..
    pause
    exit /b 1
)
cd ..

REM 3. Frontend build
echo [3/5] Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    cd ..
    pause
    exit /b 1
)
cd ..

REM 4. Restart services
echo [4/5] Restarting services...
call pm2 restart matratex-backend
call pm2 restart matratex-frontend

REM 5. Check status
echo [5/5] Checking status...
timeout /t 3 /nobreak >nul
call pm2 list

echo.
echo ========================================
echo   DEPLOYMENT COMPLETED!
echo ========================================
echo.
echo Check logs: pm2 logs
echo.
pause
