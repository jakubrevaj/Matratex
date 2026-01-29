@echo off
echo ====================================
echo MATRATEX - Frontend Deployment
echo ====================================
echo.

cd /d "%~dp0frontend"

echo Step 1: Stopping PM2 process...
pm2 stop matratex-frontend 2>nul
echo.

echo Step 2: Cleaning old build...
if exist .next rmdir /s /q .next
echo Old build removed.
echo.

echo Step 3: Building frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Check errors above.
    pause
    exit /b 1
)
echo Build completed successfully!
echo.

echo Step 4: Starting PM2 process...
pm2 restart matratex-frontend
if %ERRORLEVEL% NEQ 0 (
    echo First time start...
    pm2 start server.js --name matratex-frontend
)
echo.

echo Step 5: Saving PM2 configuration...
pm2 save
echo.

echo ====================================
echo Deployment Complete!
echo ====================================
echo.
echo Frontend is running on: http://localhost:3001
echo.
echo Check logs with: pm2 logs matratex-frontend
echo.

pause
