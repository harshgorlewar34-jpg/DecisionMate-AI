@echo off
echo ====================================================
echo   DecisionMate AI - Push to GitHub
echo ====================================================
echo.
echo User: harshgorlewar34-jpg (harshgorlewar34@gmail.com)
echo Remote: https://github.com/harshgorlewar34-jpg/DecisionMate-AI.git
echo.

set "GIT_EXE=C:\Users\harsh\AppData\Local\GitHubDesktop\app-3.6.1\resources\app\git\cmd\git.exe"

echo Checking git status...
"%GIT_EXE%" status --short

echo.
echo Pushing branch 'main' to origin...
"%GIT_EXE%" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================
    echo   Successfully pushed to GitHub!
    echo   URL: https://github.com/harshgorlewar34-jpg/DecisionMate-AI
    echo ====================================================
) else (
    echo.
    echo ----------------------------------------------------
    echo If you see 'Repository not found', please ensure you
    echo created the repository 'DecisionMate-AI' on GitHub:
    echo https://github.com/new
    echo ----------------------------------------------------
)

pause
