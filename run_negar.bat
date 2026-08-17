@echo off
title Negar Web Application
cd /d "C:\Negar_Web_PY"

:: Check if Negar server is already running on port 8000
netstat -ano | findstr :8000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo Negar Web Server is already running on http://localhost:8000.
    echo Opening application in browser...
    start "" "http://localhost:8000"
    timeout /t 2 >nul
    exit /b 0
)

echo Starting Negar Web Application...

"C:\Users\Rayanegostar\AppData\Local\Programs\Python\Python310\python.exe" main.py

if errorlevel 1 (
    echo.
    echo Server stopped with an error.
    pause
)
