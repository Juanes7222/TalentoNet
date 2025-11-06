# Script para solucionar problemas de autenticación PostgreSQL en Windows
# Este script limpia completamente PostgreSQL y lo reinicia con credenciales frescas

Write-Host "  Solucionando problemas de autenticación PostgreSQL..." -ForegroundColor Cyan
Write-Host ""

# Paso 1: Detener y eliminar TODO
Write-Host "Paso 1: Deteniendo contenedores y eliminando volúmenes..." -ForegroundColor Yellow
docker compose -f infra/docker-compose.yml down -v 2>$null
docker compose -f infra/docker-compose.yml rm -f 2>$null

# Paso 2: Eliminar contenedor específico de PostgreSQL si existe
Write-Host "Paso 2: Eliminando contenedor PostgreSQL antiguo..." -ForegroundColor Yellow
docker rm -f talentonet-postgres 2>$null

# Paso 3: Eliminar volúmenes manualmente
Write-Host "Paso 3: Limpiando volúmenes de PostgreSQL..." -ForegroundColor Yellow
docker volume rm infra_postgres_data 2>$null
docker volume rm talentonet_postgres_data 2>$null
docker volume rm postgres_data 2>$null

# Paso 4: Verificar credenciales en .env
Write-Host "Paso 4: Verificando credenciales en .env..." -ForegroundColor Yellow
if (-not (Test-Path "packages/backend/.env")) {
    Write-Host "  Archivo .env no encontrado" -ForegroundColor Red
    Write-Host "Copiando desde .env.example..." -ForegroundColor Yellow
    Copy-Item packages/backend/.env.example packages/backend/.env
}

$envContent = Get-Content packages/backend/.env -Raw
$dbPassword = ($envContent | Select-String -Pattern "DB_PASSWORD=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()

if ([string]::IsNullOrWhiteSpace($dbPassword)) {
    Write-Host "  DB_PASSWORD no está configurado en .env" -ForegroundColor Red
    exit 1
}

Write-Host "  Contraseña configurada: $dbPassword" -ForegroundColor Green

# Paso 5: Verificar credenciales en docker-compose.yml
Write-Host "Paso 5: Verificando docker-compose.yml..." -ForegroundColor Yellow
$composeContent = Get-Content infra/docker-compose.yml -Raw
$composePassword = ($composeContent | Select-String -Pattern "POSTGRES_PASSWORD:\s*(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()

Write-Host "  Contraseña en compose: $composePassword" -ForegroundColor Green

if ($dbPassword -ne $composePassword) {
    Write-Host "  Las contraseñas NO coinciden!" -ForegroundColor Red
    Write-Host "   .env tiene: $dbPassword" -ForegroundColor Yellow
    Write-Host "   docker-compose.yml tiene: $composePassword" -ForegroundColor Yellow
    Write-Host "Por favor, corrige manualmente para que sean iguales." -ForegroundColor Yellow
    exit 1
}

# Paso 6: Iniciar PostgreSQL fresco
Write-Host "Paso 6: Iniciando PostgreSQL con configuración limpia..." -ForegroundColor Yellow
docker compose -f infra/docker-compose.yml up -d postgres

Write-Host "Esperando 15 segundos para que PostgreSQL inicie completamente..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Paso 7: Verificar que PostgreSQL está corriendo
Write-Host "Paso 7: Verificando estado de PostgreSQL..." -ForegroundColor Yellow
$postgresRunning = docker ps --filter "name=talentonet-postgres" --filter "status=running" --format "{{.Names}}"

if (-not $postgresRunning) {
    Write-Host "❌ El contenedor PostgreSQL no está corriendo" -ForegroundColor Red
    Write-Host "Ver logs:" -ForegroundColor Yellow
    docker logs talentonet-postgres
    exit 1
}

Write-Host "  Contenedor PostgreSQL está corriendo" -ForegroundColor Green

# Paso 8: Verificar conexión
Write-Host "Paso 8: Probando conexión a la base de datos..." -ForegroundColor Yellow
$env:PGPASSWORD = $dbPassword

$testConnection = docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Conexión exitosa!" -ForegroundColor Green
} else {
    Write-Host "  No se pudo conectar a PostgreSQL" -ForegroundColor Red
    Write-Host "Intentando mostrar logs..." -ForegroundColor Yellow
    docker logs --tail 50 talentonet-postgres
    exit 1
}

# Paso 9: Verificar usuario y permisos
Write-Host "Paso 9: Verificando usuario y permisos..." -ForegroundColor Yellow
$users = docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db -t -c "SELECT usename FROM pg_user WHERE usename='talentonet';"

if ($users -match "talentonet") {
    Write-Host "✅ Usuario 'talentonet' existe" -ForegroundColor Green
} else {
    Write-Host "❌ Usuario 'talentonet' NO existe" -ForegroundColor Red
    exit 1
}

# Paso 10: Mostrar información de conexión
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ PostgreSQL configurado correctamente!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Información de conexión:" -ForegroundColor Cyan
Write-Host "  Host:     localhost"
Write-Host "  Puerto:   5432"
Write-Host "  Usuario:  talentonet"
Write-Host "  Password: $dbPassword"
Write-Host "  Base de datos: talentonet_db"
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Ejecutar migraciones: " -NoNewline
Write-Host ".\scripts\setup.ps1" -ForegroundColor Green
Write-Host "  2. O iniciar el backend: " -NoNewline
Write-Host "cd packages\backend; pnpm dev" -ForegroundColor Green
Write-Host ""
