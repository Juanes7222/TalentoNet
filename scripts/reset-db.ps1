# Script para resetear la base de datos de TalentoNet
# Útil cuando necesitas empezar de cero

Write-Host "ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos" -ForegroundColor Red
Write-Host "Presiona Ctrl+C para cancelar, o Enter para continuar..." -ForegroundColor Yellow
Read-Host

Write-Host "Eliminando esquema public..." -ForegroundColor Yellow
docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Esquema eliminado" -ForegroundColor Green
} else {
    Write-Host "Error eliminando esquema" -ForegroundColor Red
    exit 1
}

Write-Host "Ejecutando migraciones..." -ForegroundColor Cyan
$env:PGPASSWORD = "talentonet_secret"
Get-Content packages\backend\migrations\001_initial_schema.sql | docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migraciones ejecutadas" -ForegroundColor Green
} else {
    Write-Host "Error en migraciones" -ForegroundColor Red
    exit 1
}

Write-Host "Cargando datos de prueba..." -ForegroundColor Cyan
Get-Content packages\backend\seeds\001_seed_employees.sql | docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db

if ($LASTEXITCODE -eq 0) {
    Write-Host "Seeds ejecutados" -ForegroundColor Green
} else {
    Write-Host "Error en seeds" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Base de datos reseteada exitosamente" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "30 empleados de prueba creados" -ForegroundColor Cyan
Write-Host "3 usuarios disponibles:" -ForegroundColor Cyan
Write-Host "  - admin@talentonet.com / Admin123!" -ForegroundColor Green
Write-Host "  - rh@talentonet.com / Password123!" -ForegroundColor Green
Write-Host "  - employee1@example.com / Employee123!" -ForegroundColor Green
Write-Host ""
