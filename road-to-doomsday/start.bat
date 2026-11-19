@echo off
title ROAD TO DOOMSDAY — Quizmaster Hub
echo ========================================================
echo   ROAD TO DOOMSDAY — Retro Marvel Live Quiz Engine
echo   Quizzing Club - Tech and Data Vertical
echo ========================================================
echo.

cd /d "%~dp0tech"

if not exist node_modules (
  echo [setup] Installing dependencies...
  call npm install
)

echo [server] Starting server on port 3000...
start /b node server.js

timeout /t 2 /nobreak >nul

echo [browser] Opening Quizmaster Console and Projector Display...
start http://localhost:3000/console
start http://localhost:3000/

echo.
echo ========================================================
echo  Server is running!
echo  Display View:       http://localhost:3000/
echo  QM Console:         http://localhost:3000/console
echo  Buzzer (phones):    Public Cloudflare Tunnel (or scan Comic QR on screen)
echo ========================================================
echo.
echo Press Ctrl+C or close this window to stop the server.
echo.

:: Keep window open
pause >nul
