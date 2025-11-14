@echo off
REM Script de actualización rápida para Windows
REM Ejecuta el script PowerShell de actualización

echo ================================================
echo   ACTUALIZANDO APARTAMENTO AIRBNB
echo ================================================
echo.

REM Ejecutar el script PowerShell
powershell -ExecutionPolicy Bypass -File "%~dp0update-windows.ps1"

pause
