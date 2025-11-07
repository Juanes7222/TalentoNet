# Módulo de utilidades para Docker
# Funciones reutilizables para verificar y gestionar Docker

function Test-DockerInstalled {
    <#
    .SYNOPSIS
    Verifica si Docker está instalado
    #>
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Docker no está instalado" -ForegroundColor Red
        return $false
    }
    return $true
}

function Test-DockerRunning {
    <#
    .SYNOPSIS
    Verifica si Docker Desktop está corriendo
    #>
    try {
        docker ps *>$null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Wait-ForDockerReady {
    <#
    .SYNOPSIS
    Espera a que Docker Desktop esté listo, con opción de interacción con el usuario
    #>
    if (-not (Test-DockerRunning)) {
        Write-Host "❌ Docker Desktop no está corriendo." -ForegroundColor Red
        Write-Host "   Por favor:" -ForegroundColor Yellow
        Write-Host "   1. Abre Docker Desktop" -ForegroundColor Yellow
        Write-Host "   2. Espera a que el icono esté verde" -ForegroundColor Yellow
        Write-Host "   3. Presiona Enter para continuar..." -ForegroundColor Yellow
        Read-Host
        
        # Verificar nuevamente
        if (-not (Test-DockerRunning)) {
            Write-Host "❌ Docker Desktop aún no está listo. Abortando." -ForegroundColor Red
            return $false
        }
    }
    return $true
}

function Test-ContainerRunning {
    <#
    .SYNOPSIS
    Verifica si un contenedor específico está corriendo
    .PARAMETER ContainerName
    Nombre del contenedor a verificar
    #>
    param (
        [Parameter(Mandatory=$true)]
        [string]$ContainerName
    )
    
    $container = docker ps --filter "name=$ContainerName" --filter "status=running" --format "{{.Names}}"
    return -not [string]::IsNullOrEmpty($container)
}

function Start-DockerServices {
    <#
    .SYNOPSIS
    Inicia los servicios Docker con docker-compose
    .PARAMETER Services
    Array de nombres de servicios a iniciar (opcional, inicia todos si no se especifica)
    #>
    param (
        [string[]]$Services = @()
    )
    
    # Obtener ruta raíz del proyecto (asumiendo que el módulo está en scripts/modules/)
    $ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    $ComposeFile = Join-Path $ProjectRoot "infra\docker-compose.yml"
    
    Write-Host "🐳 Iniciando servicios Docker..." -ForegroundColor Yellow
    
    if ($Services.Count -eq 0) {
        docker-compose -f $ComposeFile up -d
    } else {
        # Construir argumentos correctamente para PowerShell
        $composeArgs = @("-f", $ComposeFile, "up", "-d") + $Services
        & docker-compose $composeArgs
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Servicios Docker iniciados" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Error al iniciar servicios Docker" -ForegroundColor Red
        return $false
    }
}

function Stop-DockerServices {
    <#
    .SYNOPSIS
    Detiene los servicios Docker
    #>
    # Obtener ruta raíz del proyecto (asumiendo que el módulo está en scripts/modules/)
    $ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    $ComposeFile = Join-Path $ProjectRoot "infra\docker-compose.yml"
    
    Write-Host "🛑 Deteniendo servicios Docker..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Servicios Docker detenidos" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Error al detener servicios Docker" -ForegroundColor Red
        return $false
    }
}

Export-ModuleMember -Function Test-DockerInstalled, Test-DockerRunning, Wait-ForDockerReady, Test-ContainerRunning, Start-DockerServices, Stop-DockerServices
