# Script de actualización para Windows
# Actualiza el código desde GitHub y reinicia los servicios

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ACTUALIZANDO APARTAMENTO AIRBNB DESDE GITHUB" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Ruta del proyecto
$ProjectPath = "C:\Users\Yulia\apartamento_airbnb"

# Verificar que existe el directorio
if (-Not (Test-Path $ProjectPath)) {
    Write-Host "ERROR: No se encuentra el directorio $ProjectPath" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Ir al directorio del proyecto
Set-Location $ProjectPath

Write-Host "[1/5] Verificando repositorio Git..." -ForegroundColor Yellow
if (-Not (Test-Path ".git")) {
    Write-Host "ERROR: Este no es un repositorio Git" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "[2/5] Guardando cambios locales (si hay)..." -ForegroundColor Yellow
git stash save "Auto-stash antes de actualizar $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" 2>&1 | Out-Null

Write-Host "[3/5] Descargando últimos cambios desde GitHub..." -ForegroundColor Yellow
git fetch origin master
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo conectar con GitHub" -ForegroundColor Red
    Write-Host "Verifica tu conexión a internet" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "[4/5] Aplicando actualizaciones..." -ForegroundColor Yellow
git pull origin master
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Hubo conflictos al actualizar" -ForegroundColor Red
    Write-Host "Ejecuta manualmente: git pull origin master" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "[5/5] Reiniciando servicios..." -ForegroundColor Yellow

# Detener procesos de Node.js
Write-Host "  - Deteniendo Node.js..." -ForegroundColor Gray
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Reiniciar Backend
Write-Host "  - Iniciando Backend..." -ForegroundColor Gray
Set-Location "$ProjectPath\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev" -WindowStyle Minimized

Start-Sleep -Seconds 3

# Reiniciar Frontend
Write-Host "  - Iniciando Frontend..." -ForegroundColor Gray
Set-Location "$ProjectPath\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Minimized

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  ✓ ACTUALIZACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Espera 10-15 segundos para que los servicios inicien completamente" -ForegroundColor Yellow
Write-Host ""

Read-Host "Presiona Enter para cerrar"
