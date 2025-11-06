# Script para resetear la base de datos y recargar datos de prueba
# ADVERTENCIA: Esto eliminará TODOS los datos y los reemplazará con datos de prueba

Write-Host "⚠️ ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos" -ForegroundColor Red
Write-Host ""
$confirmation = Read-Host "¿Estás seguro de que deseas continuar? (escribe 'SI' para confirmar)"

if ($confirmation -ne "SI") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔄 Reseteando base de datos..." -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker esté corriendo
try {
    docker ps *>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host " Docker Desktop no está corriendo" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host " Docker Desktop no está corriendo" -ForegroundColor Red
    exit 1
}

# Verificar que PostgreSQL esté corriendo
$postgresRunning = docker ps --filter "name=talentonet-postgres" --filter "status=running" --format "{{.Names}}"
if (-not $postgresRunning) {
    Write-Host " PostgreSQL no está corriendo" -ForegroundColor Red
    Write-Host "   Ejecuta primero: pnpm docker:up" -ForegroundColor Yellow
    exit 1
}

Write-Host " PostgreSQL está corriendo" -ForegroundColor Green
Write-Host ""

# Paso 1: Eliminar todas las tablas
Write-Host " Eliminando todas las tablas..." -ForegroundColor Yellow
$env:PGPASSWORD = "talentonet_secret"
docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO talentonet;
GRANT ALL ON SCHEMA public TO public;
" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host " Tablas eliminadas" -ForegroundColor Green
} else {
    Write-Host " Error al eliminar tablas" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Paso 2: Ejecutar migraciones
Write-Host " Ejecutando migraciones..." -ForegroundColor Yellow

$migrationFiles = Get-ChildItem "packages\backend\migrations\*.sql" | Sort-Object Name

$migrationSuccess = 0
foreach ($migration in $migrationFiles) {
    Write-Host "   Ejecutando $($migration.Name)..." -ForegroundColor Cyan
    Get-Content $migration.FullName | docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        $migrationSuccess++
    } else {
        Write-Host "    Error en $($migration.Name)" -ForegroundColor Red
        exit 1
    }
}

Write-Host " $migrationSuccess migraciones ejecutadas" -ForegroundColor Green
Write-Host ""

# Paso 3: Ejecutar seeds
Write-Host " Cargando datos de prueba..." -ForegroundColor Yellow
Write-Host ""

$seedFiles = @(
    "packages\backend\seeds\001_seed_employees.sql",
    "packages\backend\seeds\002_recruitment_data.sql",
    "packages\backend\seeds\003_affiliations_data.sql",
    "packages\backend\seeds\004_seed_payroll.sql"
)

$seedSuccess = 0
foreach ($seedFile in $seedFiles) {
    $fileName = Split-Path $seedFile -Leaf
    
    if (Test-Path $seedFile) {
        Write-Host "   Ejecutando $fileName..." -ForegroundColor Cyan
        Get-Content $seedFile | docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    $fileName completado" -ForegroundColor Green
            $seedSuccess++
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Base de datos reseteada exitosamente!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Datos de prueba cargados:" -ForegroundColor Yellow
Write-Host "  • 30 empleados con contratos y afiliaciones" -ForegroundColor White
Write-Host "  • 2 vacantes abiertas (Desarrollador y RRHH)" -ForegroundColor White
Write-Host "  • 4 candidatos en diferentes estados" -ForegroundColor White
Write-Host "  • 3 entrevistas programadas/completadas" -ForegroundColor White
Write-Host "  • Proveedores de ARL, EPS, AFP y Cajas" -ForegroundColor White
Write-Host ""
Write-Host "Usuarios de prueba:" -ForegroundColor Yellow
Write-Host "  Admin:  admin@talentonet.com / Password123!" -ForegroundColor Green
Write-Host "  RH:     rh@talentonet.com / Password123!" -ForegroundColor Green
Write-Host ""
