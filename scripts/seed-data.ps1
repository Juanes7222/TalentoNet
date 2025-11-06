# Script para cargar datos de prueba en TalentoNet
# Ejecuta todos los archivos SQL de seeds en orden

Write-Host "🌱 Cargando datos de prueba en TalentoNet..." -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker esté corriendo
try {
    docker ps *>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Docker Desktop no está corriendo" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  Docker Desktop no está corriendo" -ForegroundColor Red
    exit 1
}

# Verificar que PostgreSQL esté corriendo
$postgresRunning = docker ps --filter "name=talentonet-postgres" --filter "status=running" --format "{{.Names}}"
if (-not $postgresRunning) {
    Write-Host "  PostgreSQL no está corriendo" -ForegroundColor Red
    Write-Host "   Ejecuta primero: pnpm docker:up" -ForegroundColor Yellow
    exit 1
}

Write-Host "  PostgreSQL está corriendo" -ForegroundColor Green
Write-Host ""

# Lista de archivos seed en orden
$seedFiles = @(
    "packages\backend\seeds\001_seed_employees.sql",
    "packages\backend\seeds\002_recruitment_data.sql",
    "packages\backend\seeds\003_affiliations_data.sql",
    "packages\backend\seeds\004_seed_payroll.sql"
)

$seedSuccess = 0
$seedErrors = 0
$totalSeeds = $seedFiles.Count

Write-Host " Ejecutando $totalSeeds archivos de seed..." -ForegroundColor Yellow
Write-Host ""

foreach ($seedFile in $seedFiles) {
    $fileName = Split-Path $seedFile -Leaf
    
    if (Test-Path $seedFile) {
        Write-Host " Ejecutando $fileName..." -ForegroundColor Cyan
        
        # Ejecutar el seed
        $env:PGPASSWORD = "talentonet_secret"
        Get-Content $seedFile | docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   $fileName completado exitosamente" -ForegroundColor Green
            $seedSuccess++
        } else {
            Write-Host "    $fileName ejecutado con advertencias (puede ser que ya existan datos)" -ForegroundColor Yellow
            $seedErrors++
        }
    } else {
        Write-Host "    Archivo no encontrado: $seedFile" -ForegroundColor Red
        $seedErrors++
    }
    
    Write-Host ""
}

# Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resumen de ejecución de seeds:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total de seeds:        $totalSeeds" -ForegroundColor White
Write-Host "Exitosos:              $seedSuccess" -ForegroundColor Green
Write-Host "Con advertencias:      $seedErrors" -ForegroundColor Yellow
Write-Host ""

if ($seedSuccess -eq $totalSeeds) {
    Write-Host "  Todos los seeds se ejecutaron correctamente!" -ForegroundColor Green
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
} elseif ($seedSuccess -gt 0) {
    Write-Host "  Seeds ejecutados parcialmente" -ForegroundColor Yellow
    Write-Host "   Algunos datos pueden ya existir en la base de datos" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "  No se pudo ejecutar ningún seed" -ForegroundColor Red
    Write-Host "   Verifica que la base de datos esté correctamente configurada" -ForegroundColor Yellow
    Write-Host ""
}
