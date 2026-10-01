@echo off
echo ========================================================
echo   Starting Real-Time Collaborative Coding Platform
echo ========================================================
echo.
echo Launching Spring Boot Backend...
start "Collab Backend (Port 8080)" cmd /c "start-backend.bat"

timeout /t 5 /nobreak >nul

echo Launching React Frontend...
start "Collab Frontend (Port 5173)" cmd /c "start-frontend.bat"

echo.
echo Application started!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8080
echo WebSocket: ws://localhost:8080/ws
echo.
