# Script para cargar solo datos básicos (sin nómina ni afiliaciones)
# Útil para desarrollo cuando no necesitas todos los datos

$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
Import-Module "$ScriptPath\modules\docker-utils.ps1" -Force
Import-Module "$ScriptPath\modules\db-utils.ps1" -Force
Import-Module "$ScriptPath\modules\output-utils.ps1" -Force

Write-Header "Carga Rápida - Solo Datos Básicos" -Color Cyan

# Verificar PostgreSQL
if (-not (Test-ContainerRunning -ContainerName "talentonet-postgres")) {
    Write-Error "PostgreSQL no está corriendo"
    Write-Info "Ejecuta primero: pnpm docker:up"
    exit 1
}

Write-Success "PostgreSQL está corriendo"

# Obtener todos los seeds
$allSeeds = Get-SeedFiles -SeedsPath "packages\backend\seeds"

# Filtrar solo seeds básicos (excluir payroll y affiliations)
$basicSeeds = $allSeeds | Where-Object { 
    $_ -notlike "*payroll*" -and $_ -notlike "*affiliations*" 
}

Write-Section "Seeds a ejecutar (solo básicos)" -Icon "📋"
foreach ($seed in $basicSeeds) {
    $fileName = Split-Path $seed -Leaf
    Write-Info "  $fileName"
}

Write-Host ""
$confirmation = Read-Host "¿Continuar con la carga? (S/N)"

if ($confirmation -ne "S") {
    Write-Info "Operación cancelada"
    exit 0
}

# Ejecutar seeds básicos
$result = Invoke-Seeds -SeedFiles $basicSeeds -Verbose $true

Write-Summary -Title "Resultado" -Items @{
    "Total ejecutados" = "$($result.Success)/$($result.Total)"
}

Write-Success "Carga rápida completada!"
Write-Info "Se cargaron solo empleados y datos de reclutamiento"
