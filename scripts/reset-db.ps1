# Script para resetear la base de datos - Versión Modular
# Importar módulos
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Import-Module "$ScriptPath\modules\docker-utils.psm1" -Force
Import-Module "$ScriptPath\modules\db-utils.psm1" -Force
Import-Module "$ScriptPath\modules\output-utils.psm1" -Force
Import-Module "$ScriptPath\modules\workflow-utils.psm1" -Force

Write-Header "Resetear Base de Datos" -Color Red

# Confirmación
if (-not (Confirm-Action "Este script eliminará TODOS los datos de la base de datos")) {
    Write-Info "Operación cancelada"
    exit 0
}

Write-Section "Reseteando base de datos..." -Icon "🔄"

# Verificar PostgreSQL
if (-not (Invoke-PostgresCheck -StartIfNotRunning $false)) {
    exit 1
}

# Ejecutar reset completo (drop + migrations + seeds)
$result = Invoke-FullDatabaseReset -Verbose $true

if (-not $result.Success) {
    Write-Error "Hubo problemas durante el reset"
    exit 1
}

# Resumen final
Write-Header "Base de datos reseteada exitosamente!" -Color Green

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
