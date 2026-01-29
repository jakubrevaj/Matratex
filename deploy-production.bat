@echo off
REM ========================================
REM  MATRATEX - Production Deployment
REM  Windows Server 2016
REM ========================================

echo.
echo ========================================
echo   MATRATEX PRODUCTION DEPLOYMENT
echo ========================================
echo.

REM Check if running in correct directory
if not exist "backend" (
    echo ERROR: backend folder not found!
    echo Please run this script from the Vyroba_program directory.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ERROR: frontend folder not found!
    echo Please run this script from the Vyroba_program directory.
    pause
    exit /b 1
)

REM 1. Git Pull
echo [1/8] Pulling latest changes from git...
git pull origin main
if %errorlevel% neq 0 (
    echo WARNING: Git pull failed! Continuing with local changes...
    echo Press any key to continue or CTRL+C to abort...
    pause > nul
)

REM 2. Create required directories
echo [2/8] Creating required directories...
if not exist "pdfs" mkdir "pdfs"
if not exist "pdfs\dodaky" mkdir "pdfs\dodaky"
if not exist "pdfs\stitky" mkdir "pdfs\stitky"
if not exist "pdfs\prehlady" mkdir "pdfs\prehlady"
if not exist "backend\logs" mkdir "backend\logs"
if not exist "frontend\logs" mkdir "frontend\logs"
echo    - PDF directories created
echo    - Log directories created

REM 3. Check .env files
echo [3/8] Checking configuration files...
if not exist "backend\.env" (
    echo ERROR: backend\.env file not found!
    echo Creating from template...
    copy "backend\env.example" "backend\.env"
    echo Please edit backend\.env with production values!
    pause
    exit /b 1
)
echo    - Backend .env exists

if not exist "frontend\.env.local" (
    echo WARNING: frontend\.env.local not found!
    echo Creating default configuration...
    echo NEXT_PUBLIC_API_URL=http://localhost:3002 > frontend\.env.local
)
echo    - Frontend .env.local exists

REM 4. Backend - Install Dependencies
echo [4/8] Installing backend dependencies...
cd backend
call npm install --production
if %errorlevel% neq 0 (
    echo ERROR: Backend npm install failed!
    cd ..
    pause
    exit /b 1
)
echo    - Backend dependencies installed

REM 5. Backend - Build
echo [5/8] Building backend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Backend build failed!
    cd ..
    pause
    exit /b 1
)
echo    - Backend built successfully
cd ..

REM 6. Frontend - Install Dependencies
echo [6/8] Installing frontend dependencies...
cd frontend
call npm install --production
if %errorlevel% neq 0 (
    echo ERROR: Frontend npm install failed!
    cd ..
    pause
    exit /b 1
)
echo    - Frontend dependencies installed

REM 7. Frontend - Build
echo [7/8] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    cd ..
    pause
    exit /b 1
)
echo    - Frontend built successfully
cd ..

REM 8. PM2 - Restart Services
echo [8/8] Managing PM2 services...

REM Check if PM2 processes exist
pm2 list | findstr /C:"matratex-backend" > nul
if %errorlevel% equ 0 (
    echo    - Restarting existing backend process...
    call pm2 restart matratex-backend
) else (
    echo    - Starting new backend process...
    cd backend
    call pm2 start ecosystem.config.js
    cd ..
)

pm2 list | findstr /C:"matratex-frontend" > nul
if %errorlevel% equ 0 (
    echo    - Restarting existing frontend process...
    call pm2 restart matratex-frontend
) else (
    echo    - Starting new frontend process...
    cd frontend
    call pm2 start ecosystem.config.js
    cd ..
)

REM Save PM2 configuration
echo    - Saving PM2 configuration...
call pm2 save

echo.
echo ========================================
echo   DEPLOYMENT COMPLETED!
echo ========================================
echo.
echo Services Status:
pm2 list
echo.
echo Frontend: http://localhost:3001
echo Backend:  http://localhost:3002
echo.
echo Useful commands:
echo   pm2 logs                 - View all logs
echo   pm2 logs backend         - View backend logs only
echo   pm2 logs frontend        - View frontend logs only
echo   pm2 monit                - Real-time monitoring
echo   pm2 restart all          - Restart all services
echo.

pause
