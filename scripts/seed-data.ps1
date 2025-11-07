# Script para cargar datos de prueba - Versión Modular
# Importar módulos
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Import-Module "$ScriptPath\modules\db-utils.psm1" -Force
Import-Module "$ScriptPath\modules\output-utils.psm1" -Force
Import-Module "$ScriptPath\modules\workflow-utils.psm1" -Force

Write-Header "Cargando datos de prueba en TalentoNet" -Color Cyan

# Verificar PostgreSQL
if (-not (Invoke-PostgresCheck -StartIfNotRunning $false)) {
    exit 1
}

# Ejecutar seeds (automáticamente detecta todos los archivos .sql en seeds/)
$seedFiles = Get-SeedFiles -SeedsPath "packages\backend\seeds"

if ($seedFiles.Count -eq 0) {
    Write-Error "No se encontraron archivos de seed"
    Write-Info "Verifica que existan archivos .sql en packages\backend\seeds\"
    exit 1
}

Write-Info "Se encontraron $($seedFiles.Count) archivos de seed"

$seedResult = Invoke-Seeds -SeedFiles $seedFiles -Verbose $true

# Resumen
Write-Summary -Title "Resumen de ejecución de seeds" -Items @{
    "Total de seeds" = "$($seedResult.Total)"
    "Exitosos" = "$($seedResult.Success)"
    "Con advertencias" = "$($seedResult.Failed)"
} -Color Cyan

if ($seedResult.Success -eq $seedResult.Total) {
    Write-Header "Todos los seeds se ejecutaron correctamente!" -Color Green
    
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
} elseif ($seedResult.Success -gt 0) {
    Write-Warning "Seeds ejecutados parcialmente"
    Write-Info "Algunos datos pueden ya existir en la base de datos"
} else {
    Write-Error "No se pudo ejecutar ningún seed"
    Write-Info "Verifica que la base de datos esté correctamente configurada"
}
