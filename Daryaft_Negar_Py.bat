@echo off
chcp 65001 > nul
title Daryaft Negar Web PY (syshesanb)

echo ========================================================
echo   Checking and Updating GitHub Repository...
echo   Account : syshesanb@gmail.com
echo   Project : Negar_Web_PY
echo ========================================================
echo.

set TARGET_DIR=C:\Negar_Web_PY
set REPO_NAME=Negar_Web_PY

REM --- Check if repo exists ---
if not exist "%TARGET_DIR%\%REPO_NAME%" goto CLONE_REPO

echo Repository already exists. Pulling latest changes...
cd /d "%TARGET_DIR%\%REPO_NAME%"
git pull
echo.
echo Done! Repository is up to date.
goto FINISH

:CLONE_REPO
echo Repository not found. Cloning from GitHub...
echo.
git clone git@github.com-syshesanb:syshesanb/Negar_Web_PY.git "%TARGET_DIR%\%REPO_NAME%"
if not exist "%TARGET_DIR%\%REPO_NAME%" goto ERROR

cd /d "%TARGET_DIR%\%REPO_NAME%"
git config user.name "Syshesanb"
git config user.email "syshesanb@gmail.com"
echo.
echo Done! Repository cloned successfully.
goto FINISH

:ERROR
echo.
echo ERROR: Clone failed. Please check your internet connection or GitHub access.
echo.
goto FINISH

:FINISH
echo.
echo ========================================================
echo   Operation Completed.
echo ========================================================
echo.
pause
