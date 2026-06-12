@echo off

node .\scripts\prepare-project-r-pdf.mjs
if errorlevel 1 (
    echo prepare-project-r-pdf.mjs failed
    pause
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate-pdf.ps1"

pause