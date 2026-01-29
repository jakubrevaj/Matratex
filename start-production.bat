@echo off
echo ====================================
echo MATRATEX - Production Start
echo ====================================
echo.

REM Stop all existing processes
echo Stopping existing processes...
pm2 delete all
pm2 flush

REM Backend
echo.
echo Starting Backend...
cd /d "%~dp0backend"
if not exist logs mkdir logs
pm2 start ecosystem.config.js
echo Backend started!

REM Frontend
echo.
echo Starting Frontend...
cd /d "%~dp0frontend"
if not exist logs mkdir logs
if not exist .next (
    echo ERROR: Frontend not built! Run: npm run build
    echo Building now...
    call npm run build
)
pm2 start ecosystem.config.js
echo Frontend started!

REM Save PM2 configuration
echo.
echo Saving PM2 configuration...
pm2 save

echo.
echo ====================================
echo Production Started!
echo ====================================
echo.
echo Frontend: http://localhost:3001
echo Backend:  http://localhost:3002
echo.
echo Commands:
echo   pm2 list             - show all processes
echo   pm2 logs             - show logs
echo   pm2 restart all      - restart all
echo   pm2 stop all         - stop all
echo.

pause
