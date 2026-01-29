@echo off
echo ====================================
echo MATRATEX - Database Configuration
echo ====================================
echo.

cd /d "%~dp0backend"

echo Creating .env file...
(
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_USERNAME=postgres
echo DB_PASSWORD=admin
echo DB_DATABASE=matratex
echo.
echo # Email configuration
echo EMAIL_HOST=smtp.gmail.com
echo EMAIL_PORT=587
echo EMAIL_SECURE=false
echo EMAIL_USER=
echo EMAIL_PASSWORD=
echo EMAIL_FROM=
echo.
echo # Server configuration
echo PORT=3002
echo NODE_ENV=production
echo.
echo # CORS
echo CORS_ORIGIN=http://localhost:3001
echo.
echo # JWT
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
echo JWT_EXPIRATION=7d
) > .env

echo .env file created successfully!
echo.
echo Restarting PM2 processes...
pm2 restart matratex-backend
pm2 restart matratex-frontend

echo.
echo ====================================
echo Configuration complete!
echo ====================================
echo.
echo Backend should now connect to database: matratex
echo Username: postgres
echo.

pause
