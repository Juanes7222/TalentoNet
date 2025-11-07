# Ejemplos de uso de Get-SeedFiles
# Este archivo muestra diferentes formas de obtener y filtrar archivos de seed

$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Import-Module "$ScriptPath\modules\db-utils.ps1" -Force
Import-Module "$ScriptPath\modules\output-utils.ps1" -Force

Write-Header "Ejemplos de Get-SeedFiles" -Color Cyan

# ============================================
# Ejemplo 1: Obtener todos los seeds
# ============================================
Write-Section "Ejemplo 1: Todos los seeds" -Icon "📋"

$allSeeds = Get-SeedFiles -SeedsPath "packages\backend\seeds"
Write-Info "Se encontraron $($allSeeds.Count) archivos de seed:"
foreach ($seed in $allSeeds) {
    $fileName = Split-Path $seed -Leaf
    Write-Host "  - $fileName" -ForegroundColor Gray
}

# ============================================
# Ejemplo 2: Filtrar seeds específicos
# ============================================
Write-Section "Ejemplo 2: Solo seeds de empleados" -Icon "👥"

$allSeeds = Get-SeedFiles -SeedsPath "packages\backend\seeds"
$employeeSeeds = $allSeeds | Where-Object { $_ -like "*employee*" }

Write-Info "Seeds relacionados con empleados:"
foreach ($seed in $employeeSeeds) {
    $fileName = Split-Path $seed -Leaf
    Write-Host "  - $fileName" -ForegroundColor Gray
}

# ============================================
# Ejemplo 3: Ejecutar solo algunos seeds
# ============================================
Write-Section "Ejemplo 3: Ejecutar seeds 001 y 002" -Icon "⚡"

$allSeeds = Get-SeedFiles -SeedsPath "packages\backend\seeds"
$selectedSeeds = $allSeeds | Where-Object { 
    $_ -like "*001_*" -or $_ -like "*002_*" 
}

Write-Info "Seeds seleccionados:"
foreach ($seed in $selectedSeeds) {
    $fileName = Split-Path $seed -Leaf
    Write-Host "  - $fileName" -ForegroundColor Gray
}

# Para ejecutarlos:
# $result = Invoke-Seeds -SeedFiles $selectedSeeds -Verbose $true

# ============================================
# Ejemplo 4: Excluir seeds específicos
# ============================================
Write-Section "Ejemplo 4: Excluir payroll" -Icon "🚫"

$allSeeds = Get-SeedFiles -SeedsPath "packages\backend\seeds"
$withoutPayroll = $allSeeds | Where-Object { $_ -notlike "*payroll*" }

Write-Info "Seeds sin payroll:"
foreach ($seed in $withoutPayroll) {
    $fileName = Split-Path $seed -Leaf
    Write-Host "  - $fileName" -ForegroundColor Gray
}

# ============================================
# Ejemplo 5: Ejecutar seeds en orden inverso
# ============================================
Write-Section "Ejemplo 5: Orden inverso" -Icon "🔄"

$allSeeds = Get-SeedFiles -SeedsPath "packages\backend\seeds"
$reverseSeeds = $allSeeds | Sort-Object -Descending

Write-Info "Seeds en orden inverso (útil para rollback):"
foreach ($seed in $reverseSeeds) {
    $fileName = Split-Path $seed -Leaf
    Write-Host "  - $fileName" -ForegroundColor Gray
}

# ============================================
# Ejemplo 6: Usar patrón personalizado
# ============================================
Write-Section "Ejemplo 6: Patrón personalizado" -Icon "🎯"

# Solo archivos que empiezan con 00
$pattern = "00*.sql"
$filteredSeeds = Get-SeedFiles -SeedsPath "packages\backend\seeds" -Pattern $pattern

Write-Info "Seeds con patrón '$pattern':"
foreach ($seed in $filteredSeeds) {
    $fileName = Split-Path $seed -Leaf
    Write-Host "  - $fileName" -ForegroundColor Gray
}

Write-Header "Ejemplos completados" -Color Green

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "  • Get-SeedFiles detecta automáticamente todos los .sql en seeds/" -ForegroundColor White
Write-Host "  • Los archivos se ordenan automáticamente por nombre" -ForegroundColor White
Write-Host "  • Usa Where-Object para filtrar seeds específicos" -ForegroundColor White
Write-Host "  • Usa -Pattern para buscar archivos con patrón específico" -ForegroundColor White
Write-Host ""
