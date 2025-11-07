# Módulo de utilidades para Node.js y pnpm
# Funciones reutilizables para verificar y gestionar el entorno Node.js

function Test-NodeInstalled {
    <#
    .SYNOPSIS
    Verifica si Node.js está instalado
    .PARAMETER MinVersion
    Versión mínima requerida (default: 20.0.0)
    #>
    param (
        [string]$MinVersion = "20.0.0"
    )
    
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Node.js no está instalado. Instala Node.js >= $MinVersion" -ForegroundColor Red
        return $false
    }
    
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion instalado" -ForegroundColor Green
    return $true
}

function Test-PnpmInstalled {
    <#
    .SYNOPSIS
    Verifica si pnpm está instalado
    #>
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        return $false
    }
    return $true
}

function Install-Pnpm {
    <#
    .SYNOPSIS
    Instala pnpm globalmente usando npm
    #>
    Write-Host "📦 Instalando pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ pnpm instalado correctamente" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Error al instalar pnpm" -ForegroundColor Red
        return $false
    }
}

function Install-Dependencies {
    <#
    .SYNOPSIS
    Instala las dependencias del proyecto usando pnpm
    .PARAMETER FrozenLockfile
    Si es true, usa --frozen-lockfile (default: true si existe pnpm-lock.yaml)
    #>
    param (
        [bool]$FrozenLockfile = (Test-Path "pnpm-lock.yaml")
    )
    
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
    
    if ($FrozenLockfile) {
        Write-Host "  Usando pnpm install --frozen-lockfile" -ForegroundColor Gray
        pnpm install --frozen-lockfile
    } else {
        Write-Host "  Usando pnpm install (generando lockfile)" -ForegroundColor Yellow
        pnpm install
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
        return $false
    }
}

function Test-Prerequisites {
    <#
    .SYNOPSIS
    Verifica todos los prerequisitos (Node.js, pnpm, Docker)
    .PARAMETER InstallPnpm
    Si es true, instala pnpm automáticamente si no está presente (default: true)
    #>
    param (
        [bool]$InstallPnpm = $true
    )
    
    Write-Host "🔍 Verificando prerequisitos..." -ForegroundColor Cyan
    Write-Host ""
    
    $allOk = $true
    
    # Verificar Node.js
    if (-not (Test-NodeInstalled)) {
        $allOk = $false
    }
    
    # Verificar pnpm
    if (-not (Test-PnpmInstalled)) {
        if ($InstallPnpm) {
            if (-not (Install-Pnpm)) {
                $allOk = $false
            }
        } else {
            Write-Host "❌ pnpm no está instalado" -ForegroundColor Red
            $allOk = $false
        }
    } else {
        $pnpmVersion = pnpm --version
        Write-Host "✅ pnpm $pnpmVersion instalado" -ForegroundColor Green
    }
    
    # Verificar Docker
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Docker no está instalado" -ForegroundColor Red
        $allOk = $false
    } else {
        Write-Host "✅ Docker instalado" -ForegroundColor Green
    }
    
    Write-Host ""
    
    if ($allOk) {
        Write-Host "✅ Todos los prerequisitos están instalados" -ForegroundColor Green
    } else {
        Write-Host "❌ Algunos prerequisitos faltan" -ForegroundColor Red
    }
    
    return $allOk
}

Export-ModuleMember -Function Test-NodeInstalled, Test-PnpmInstalled, Install-Pnpm, Install-Dependencies, Test-Prerequisites
