#!/usr/bin/env pwsh
# Script para ejecutar pruebas E2E de Cypress
# Asume que el backend y frontend ya están corriendo

Write-Host "🔍 Verificando que los servicios estén corriendo..." -ForegroundColor Cyan

# Verificar backend
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/login" -Method OPTIONS -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Backend corriendo en puerto 3000" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend NO está corriendo en puerto 3000" -ForegroundColor Red
    Write-Host "   Por favor ejecuta: pnpm --filter backend dev" -ForegroundColor Yellow
    exit 1
}

# Verificar frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method HEAD -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Frontend corriendo en puerto 5173" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend NO está corriendo en puerto 5173" -ForegroundColor Red
    Write-Host "   Por favor ejecuta: pnpm --filter frontend dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🚀 Ejecutando pruebas E2E con Cypress..." -ForegroundColor Cyan
Write-Host ""

# Ejecutar Cypress
Set-Location "$PSScriptRoot\.."
pnpm --filter frontend cypress:run

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Todas las pruebas E2E pasaron exitosamente!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Algunas pruebas E2E fallaron" -ForegroundColor Red
    exit $LASTEXITCODE
}
