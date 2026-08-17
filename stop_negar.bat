@echo off
title Stop Negar Web Server
echo Stopping Negar Web Server...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Negar Web Server stopped successfully.
timeout /t 2 >nul
