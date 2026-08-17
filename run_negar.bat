@echo off
title Negar Web Application
cd /d "C:\Negar_Web_PY"

echo Starting Negar Web Application...

"C:\Users\Rayanegostar\AppData\Local\Programs\Python\Python310\python.exe" main.py

if errorlevel 1 (
    echo.
    echo Server stopped with an error.
    pause
)
