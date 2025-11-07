# Script helper para desarrolladores - Menú interactivo
# Importar módulos
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Import-Module "$ScriptPath\modules\docker-utils.psm1" -Force
Import-Module "$ScriptPath\modules\db-utils.psm1" -Force
Import-Module "$ScriptPath\modules\node-utils.psm1" -Force
Import-Module "$ScriptPath\modules\env-utils.psm1" -Force
Import-Module "$ScriptPath\modules\minio-utils.psm1" -Force
Import-Module "$ScriptPath\modules\output-utils.psm1" -Force
Import-Module "$ScriptPath\modules\workflow-utils.psm1" -Force

function Show-Menu {
    Clear-Host
    Write-Header "TalentoNet - Developer Helper" -Color Cyan
    
    Write-Host "Selecciona una opción:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. 🚀 Setup inicial completo" -ForegroundColor White
    Write-Host "  2. 🐳 Iniciar servicios Docker" -ForegroundColor White
    Write-Host "  3. 🛑 Detener servicios Docker" -ForegroundColor White
    Write-Host "  4. 📋 Ejecutar migraciones" -ForegroundColor White
    Write-Host "  5. 🌱 Cargar datos de prueba" -ForegroundColor White
    Write-Host "  6. 🔄 Resetear base de datos" -ForegroundColor White
    Write-Host "  7. ✅ Verificar estado del sistema" -ForegroundColor White
    Write-Host "  8. 📝 Inicializar archivos .env" -ForegroundColor White
    Write-Host "  9. 🪣 Configurar bucket MinIO" -ForegroundColor White
    Write-Host "  0. 🚪 Salir" -ForegroundColor White
    Write-Host ""
}

function Invoke-SetupCompleto {
    Write-Header "Setup Inicial Completo" -Color Cyan
    
    if (-not (Invoke-PrerequisitesCheck -StartServices $false)) {
        Read-Host "Presiona Enter para continuar..."
        return
    }
    
    Install-Dependencies
    Initialize-AllEnvFiles
    Start-DockerServices -Services @("postgres", "rabbitmq", "minio")
    Wait-ForPostgres -Timeout 30
    
    # Usar función de workflow
    Invoke-DatabaseSetup -Verbose $true
    
    Initialize-MinioBucket -BucketName "talentonet-documents" -PublicRead $true
    
    Write-Success "Setup completado!"
    Read-Host "Presiona Enter para continuar..."
}

function Invoke-IniciarDocker {
    Write-Section "Iniciando servicios Docker" -Icon "🐳"
    
    if (Start-DockerServices -Services @("postgres", "rabbitmq", "minio")) {
        Wait-ForPostgres -Timeout 30
        Write-Success "Servicios iniciados correctamente"
    }
    
    Read-Host "Presiona Enter para continuar..."
}

function Invoke-DetenerDocker {
    Write-Section "Deteniendo servicios Docker" -Icon "🛑"
    
    if (Confirm-Action "Esto detendrá todos los servicios Docker") {
        Stop-DockerServices
        Write-Success "Servicios detenidos"
    }
    
    Read-Host "Presiona Enter para continuar..."
}

function Invoke-EjecutarMigraciones {
    Write-Section "Ejecutando migraciones" -Icon "📋"
    
    if (-not (Invoke-PostgresCheck -StartIfNotRunning $false)) {
        Read-Host "Presiona Enter para continuar..."
        return
    }
    
    # Usar función de workflow (solo migraciones)
    $result = Invoke-DatabaseSetup -SkipSeeds $true -Verbose $true
    
    Write-Summary -Title "Resultado de migraciones" -Items @{
        "Total" = "$($result.Migrations.Total)"
        "Exitosas" = "$($result.Migrations.Success)"
        "Fallidas" = "$($result.Migrations.Failed)"
    }
    
    Read-Host "Presiona Enter para continuar..."
}

function Invoke-CargarSeeds {
    Write-Section "Cargando datos de prueba" -Icon "🌱"
    
    if (-not (Invoke-PostgresCheck -StartIfNotRunning $false)) {
        Read-Host "Presiona Enter para continuar..."
        return
    }
    
    # Obtener seeds automáticamente
    $seedFiles = Get-SeedFiles -SeedsPath "packages\backend\seeds"
    
    if ($seedFiles.Count -eq 0) {
        Write-Error "No se encontraron archivos de seed"
        Write-Info "Verifica que existan archivos .sql en packages\backend\seeds\"
        Read-Host "Presiona Enter para continuar..."
        return
    }
    
    Write-Info "Se encontraron $($seedFiles.Count) archivos de seed"
    
    $result = Invoke-Seeds -SeedFiles $seedFiles -Verbose $true
    
    Write-Summary -Title "Resultado de seeds" -Items @{
        "Total" = "$($result.Total)"
        "Exitosos" = "$($result.Success)"
        "Con advertencias" = "$($result.Failed)"
    }
    
    Read-Host "Presiona Enter para continuar..."
}

function Invoke-ResetearBD {
    Write-Section "Resetear Base de Datos" -Icon "🔄"
    
    if (-not (Confirm-Action "Esto eliminará TODOS los datos de la base de datos")) {
        Write-Info "Operación cancelada"
        Read-Host "Presiona Enter para continuar..."
        return
    }
    
    if (-not (Invoke-PostgresCheck -StartIfNotRunning $false)) {
        Read-Host "Presiona Enter para continuar..."
        return
    }
    
    # Usar función de workflow para reset completo
    Invoke-FullDatabaseReset -Verbose $true
    
    Write-Success "Base de datos reseteada!"
    Read-Host "Presiona Enter para continuar..."
}

function Invoke-VerificarEstado {
    Write-Section "Verificando estado del sistema" -Icon "✅"
    
    # Usar función de workflow unificada
    Invoke-PrerequisitesCheck -CheckDocker $true -CheckPostgres $true -CheckNode $false -StartServices $false
    
    # PostgreSQL - información adicional
    if (Test-ContainerRunning -ContainerName "talentonet-postgres") {
        Write-Host ""
        Write-Host "PostgreSQL:" -ForegroundColor Yellow
        $result = Invoke-SqlCommand -Command "SELECT COUNT(*) FROM employees;" -Silent $false
        if ($result) {
            Write-Success "Base de datos responde correctamente"
        }
    }
    
    Read-Host "Presiona Enter para continuar..."
}

function Invoke-InicializarEnv {
    Write-Section "Inicializando archivos .env" -Icon "📝"
    
    Initialize-AllEnvFiles
    
    Write-Success "Archivos .env configurados"
    Write-Info "Recuerda editar los valores en packages\backend\.env"
    
    Read-Host "Presiona Enter para continuar..."
}

function Invoke-ConfigurarMinIO {
    Write-Section "Configurando MinIO" -Icon "🪣"
    
    if (-not (Test-ContainerRunning -ContainerName "talentonet-minio")) {
        Write-Error "MinIO no está corriendo"
        Write-Info "Ejecuta primero 'Iniciar servicios Docker'"
        Read-Host "Presiona Enter para continuar..."
        return
    }
    
    Initialize-MinioBucket -BucketName "talentonet-documents" -PublicRead $true
    
    Write-Success "MinIO configurado"
    
    Read-Host "Presiona Enter para continuar..."
}

# Menú principal
do {
    Show-Menu
    $selection = Read-Host "Ingresa una opción"
    
    switch ($selection) {
        '1' { Invoke-SetupCompleto }
        '2' { Invoke-IniciarDocker }
        '3' { Invoke-DetenerDocker }
        '4' { Invoke-EjecutarMigraciones }
        '5' { Invoke-CargarSeeds }
        '6' { Invoke-ResetearBD }
        '7' { Invoke-VerificarEstado }
        '8' { Invoke-InicializarEnv }
        '9' { Invoke-ConfigurarMinIO }
        '0' { 
            Write-Header "¡Hasta luego!" -Color Green
            exit 
        }
        default {
            Write-Warning "Opción inválida"
            Read-Host "Presiona Enter para continuar..."
        }
    }
} while ($true)
