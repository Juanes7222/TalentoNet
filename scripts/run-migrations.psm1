# Script para ejecutar solo las migraciones - Versión Modular
# Importar módulos
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Import-Module "$ScriptPath\modules\db-utils.psm1" -Force
Import-Module "$ScriptPath\modules\output-utils.psm1" -Force
Import-Module "$ScriptPath\modules\workflow-utils.psm1" -Force

Write-Header "Ejecutar Migraciones de Base de Datos" -Color Cyan

# Verificar PostgreSQL
if (-not (Invoke-PostgresCheck -StartIfNotRunning $false)) {
    exit 1
}

# Ejecutar solo migraciones (sin seeds)
$result = Invoke-DatabaseSetup -SkipSeeds $true -Verbose $true

# Resumen
Write-Summary -Title "Resumen de migraciones" -Items @{
    "Total de migraciones" = "$($migrationResult.Total)"
    "Ejecutadas exitosamente" = "$($migrationResult.Success)"
    "Con errores" = "$($migrationResult.Failed)"
} -Color Cyan

if ($migrationResult.Success -eq $migrationResult.Total) {
    Write-Success "Todas las migraciones se ejecutaron correctamente!"
} elseif ($migrationResult.Success -gt 0) {
    Write-Warning "Algunas migraciones ya estaban aplicadas"
} else {
    Write-Error "No se pudo ejecutar ninguna migración"
    exit 1
}
