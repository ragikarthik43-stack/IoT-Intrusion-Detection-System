@echo off
title IoT IDS - System Launcher
echo ==========================================================
echo Starting IoT/IIoT Intrusion Detection System
echo ==========================================================
set PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%

echo [1/2] Starting Backend API Server (Port 5001)...
start "IDS Backend Server" cmd /k "set PATH=%LOCALAPPDATA%\Programs\nodejs;%%PATH%% && cd /d %~dp0server && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Vite Server (Port 3000)...
start "IDS Frontend Client" cmd /k "set PATH=%LOCALAPPDATA%\Programs\nodejs;%%PATH%% && cd /d %~dp0client && npm run dev"

echo ==========================================================
echo Both servers are launching!
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:3000
echo Default Login: admin / admin123
echo ==========================================================
pause
