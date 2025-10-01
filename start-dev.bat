@echo off
echo Starting DesignDeck Development Environment...
echo.

echo Starting Backend Server...
start "DesignDeck Backend" cmd /k "cd server && npm install && npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend...
start "DesignDeck Frontend" cmd /k "npm install && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:4200
echo.
echo Press any key to exit...
pause > nul
