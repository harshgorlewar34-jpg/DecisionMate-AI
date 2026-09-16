@echo off
title DecisionMate AI Launcher
echo =======================================================
echo   Starting DecisionMate AI (Backend + Frontend)
echo =======================================================
echo.
echo Opening Backend on http://localhost:5000
echo Opening Frontend on http://localhost:5173
echo.

cd /d "%~dp0"
npm run dev
pause
