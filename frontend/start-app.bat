@echo off
echo Starting School Health Management System...
echo.
echo Backend API will start on http://localhost:3000
echo Frontend will start on http://localhost:3001
echo.

start "Backend" cmd /k "cd .. && npm start"
timeout /t 3
start "Frontend" cmd /k "npm start"

echo.
echo Both services are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Press any key to close this window...
pause > nul
