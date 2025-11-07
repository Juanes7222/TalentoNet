# Módulo de flujos de trabajo comunes
# Funciones de alto nivel que combinan múltiples operaciones

function Invoke-DatabaseSetup {
    <#
    .SYNOPSIS
    Flujo completo de setup de base de datos: migraciones + seeds
    .PARAMETER MigrationsPath
    Ruta al directorio de migraciones (default: packages\backend\migrations)
    .PARAMETER SeedsPath
    Ruta al directorio de seeds (default: packages\backend\seeds)
    .PARAMETER SeedFilter
    ScriptBlock para filtrar seeds (opcional)
    .PARAMETER SkipSeeds
    Si es true, no ejecuta seeds (default: false)
    .PARAMETER Verbose
    Si es true, muestra mensajes detallados
    #>
    param (
        [string]$MigrationsPath = "packages\backend\migrations",
        [string]$SeedsPath = "packages\backend\seeds",
        [scriptblock]$SeedFilter = $null,
        [bool]$SkipSeeds = $false,
        [bool]$Verbose = $true
    )
    
    if ($Verbose) {
        Write-Host "🔧 Configurando base de datos..." -ForegroundColor Cyan
    }
    
    # Ejecutar migraciones
    $migrationResult = Invoke-Migrations -MigrationsPath $MigrationsPath -Verbose $Verbose
    
    if ($migrationResult.Success -eq 0 -and $migrationResult.Total -gt 0) {
        if ($Verbose) {
            Write-Host "⚠️  No se ejecutaron migraciones correctamente" -ForegroundColor Yellow
        }
        return @{
            Success = $false
            Migrations = $migrationResult
            Seeds = $null
        }
    }
    
    # Ejecutar seeds si no se especifica SkipSeeds
    $seedResult = $null
    if (-not $SkipSeeds) {
        $seedFiles = Get-SeedFiles -SeedsPath $SeedsPath
        
        # Aplicar filtro si existe
        if ($SeedFilter -ne $null) {
            $seedFiles = $seedFiles | Where-Object $SeedFilter
        }
        
        if ($seedFiles.Count -gt 0) {
            $seedResult = Invoke-Seeds -SeedFiles $seedFiles -Verbose $Verbose
        } elseif ($Verbose) {
            Write-Host "⚠️  No se encontraron archivos de seed" -ForegroundColor Yellow
        }
    }
    
    return @{
        Success = $true
        Migrations = $migrationResult
        Seeds = $seedResult
    }
}

function Invoke-FullDatabaseReset {
    <#
    .SYNOPSIS
    Flujo completo de reset: eliminar todo + migraciones + seeds
    .PARAMETER MigrationsPath
    Ruta al directorio de migraciones
    .PARAMETER SeedsPath
    Ruta al directorio de seeds
    .PARAMETER SeedFilter
    ScriptBlock para filtrar seeds (opcional)
    .PARAMETER Verbose
    Si es true, muestra mensajes detallados
    #>
    param (
        [string]$MigrationsPath = "packages\backend\migrations",
        [string]$SeedsPath = "packages\backend\seeds",
        [scriptblock]$SeedFilter = $null,
        [bool]$Verbose = $true
    )
    
    if ($Verbose) {
        Write-Host "🔄 Reseteando base de datos completa..." -ForegroundColor Yellow
    }
    
    # Resetear esquema
    $resetSuccess = Reset-Database -Verbose $Verbose
    
    if (-not $resetSuccess) {
        return @{
            Success = $false
            Reset = $false
            Migrations = $null
            Seeds = $null
        }
    }
    
    # Ejecutar setup completo
    $setupResult = Invoke-DatabaseSetup `
        -MigrationsPath $MigrationsPath `
        -SeedsPath $SeedsPath `
        -SeedFilter $SeedFilter `
        -Verbose $Verbose
    
    return @{
        Success = $setupResult.Success
        Reset = $true
        Migrations = $setupResult.Migrations
        Seeds = $setupResult.Seeds
    }
}

function Invoke-PostgresCheck {
    <#
    .SYNOPSIS
    Verifica que PostgreSQL esté corriendo y listo, con mensajes útiles
    .PARAMETER StartIfNotRunning
    Si es true, intenta iniciar PostgreSQL si no está corriendo
    .PARAMETER WaitTimeout
    Tiempo máximo de espera en segundos (default: 30)
    #>
    param (
        [bool]$StartIfNotRunning = $false,
        [int]$WaitTimeout = 30
    )
    
    # Verificar que el contenedor esté corriendo
    if (-not (Test-ContainerRunning -ContainerName "talentonet-postgres")) {
        Write-Host "❌ PostgreSQL no está corriendo" -ForegroundColor Red
        
        if ($StartIfNotRunning) {
            Write-Host "⏳ Intentando iniciar PostgreSQL..." -ForegroundColor Yellow
            Start-DockerServices -Services @("postgres")
            
            if (-not (Wait-ForPostgres -Timeout $WaitTimeout)) {
                Write-Host "❌ No se pudo iniciar PostgreSQL" -ForegroundColor Red
                Write-Host "ℹ️  Ejecuta manualmente: pnpm docker:up" -ForegroundColor Cyan
                return $false
            }
        } else {
            Write-Host "ℹ️  Ejecuta: pnpm docker:up" -ForegroundColor Cyan
            return $false
        }
    }
    
    # Verificar conectividad
    if (-not (Wait-ForPostgres -Timeout $WaitTimeout)) {
        Write-Host "❌ PostgreSQL no responde" -ForegroundColor Red
        return $false
    }
    
    Write-Host "✅ PostgreSQL está listo" -ForegroundColor Green
    return $true
}

function Invoke-DockerCheck {
    <#
    .SYNOPSIS
    Verifica que Docker esté corriendo y los servicios necesarios estén activos
    .PARAMETER RequiredServices
    Array de nombres de contenedores requeridos (default: postgres, rabbitmq, minio)
    .PARAMETER StartIfNotRunning
    Si es true, intenta iniciar servicios si no están corriendo
    #>
    param (
        [string[]]$RequiredServices = @("talentonet-postgres", "talentonet-rabbitmq", "talentonet-minio"),
        [bool]$StartIfNotRunning = $false
    )
    
    # Verificar Docker
    if (-not (Test-DockerRunning)) {
        Write-Host "❌ Docker Desktop no está corriendo" -ForegroundColor Red
        
        if (-not (Wait-ForDockerReady)) {
            return $false
        }
    }
    
    Write-Host "✅ Docker Desktop está corriendo" -ForegroundColor Green
    
    # Verificar servicios requeridos
    $allRunning = $true
    $notRunning = @()
    
    foreach ($service in $RequiredServices) {
        if (Test-ContainerRunning -ContainerName $service) {
            Write-Host "  ✅ $service" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $service no está corriendo" -ForegroundColor Yellow
            $allRunning = $false
            $notRunning += $service
        }
    }
    
    if (-not $allRunning) {
        if ($StartIfNotRunning) {
            Write-Host "⏳ Iniciando servicios faltantes..." -ForegroundColor Yellow
            
            # Extraer nombres de servicio sin prefijo "talentonet-"
            $serviceNames = $notRunning | ForEach-Object { $_ -replace "^talentonet-", "" }
            Start-DockerServices -Services $serviceNames
            
            # Esperar a PostgreSQL si está en la lista
            if ($notRunning -contains "talentonet-postgres") {
                Wait-ForPostgres -Timeout 30
            }
        } else {
            Write-Host "ℹ️  Ejecuta: pnpm docker:up" -ForegroundColor Cyan
            return $false
        }
    }
    
    return $true
}

function Invoke-PrerequisitesCheck {
    <#
    .SYNOPSIS
    Verifica todos los prerequisitos del proyecto en un solo paso
    .PARAMETER CheckDocker
    Si es true, verifica Docker (default: true)
    .PARAMETER CheckPostgres
    Si es true, verifica PostgreSQL (default: true)
    .PARAMETER CheckNode
    Si es true, verifica Node.js (default: true)
    .PARAMETER StartServices
    Si es true, intenta iniciar servicios si no están corriendo (default: false)
    #>
    param (
        [bool]$CheckDocker = $true,
        [bool]$CheckPostgres = $true,
        [bool]$CheckNode = $true,
        [bool]$StartServices = $false
    )
    
    Write-Host "🔍 Verificando prerequisitos..." -ForegroundColor Cyan
    Write-Host ""
    
    $allOk = $true
    
    # Verificar Node.js y pnpm
    if ($CheckNode) {
        if (-not (Test-Prerequisites -InstallPnpm $true)) {
            $allOk = $false
        }
    }
    
    # Verificar Docker y servicios
    if ($CheckDocker) {
        if (-not (Invoke-DockerCheck -StartIfNotRunning $StartServices)) {
            $allOk = $false
        }
    }
    
    # Verificar PostgreSQL específicamente
    if ($CheckPostgres -and -not (Invoke-PostgresCheck -StartIfNotRunning $StartServices)) {
        $allOk = $false
    }
    
    Write-Host ""
    if ($allOk) {
        Write-Host "✅ Todos los prerequisitos están listos" -ForegroundColor Green
    } else {
        Write-Host "❌ Algunos prerequisitos faltan" -ForegroundColor Red
    }
    
    return $allOk
}

Export-ModuleMember -Function Invoke-DatabaseSetup, Invoke-FullDatabaseReset, Invoke-PostgresCheck, Invoke-DockerCheck, Invoke-PrerequisitesCheck
