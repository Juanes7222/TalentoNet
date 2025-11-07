# Módulo de utilidades para variables de entorno
# Funciones reutilizables para gestionar archivos .env

function Initialize-EnvFile {
    <#
    .SYNOPSIS
    Copia el archivo .env.example a .env si no existe
    .PARAMETER SourcePath
    Ruta al archivo .env.example
    .PARAMETER TargetPath
    Ruta donde crear el archivo .env
    .PARAMETER Force
    Si es true, sobrescribe el archivo .env existente
    #>
    param (
        [Parameter(Mandatory=$true)]
        [string]$SourcePath,
        
        [Parameter(Mandatory=$true)]
        [string]$TargetPath,
        
        [bool]$Force = $false
    )
    
    if (Test-Path $TargetPath) {
        if ($Force) {
            Copy-Item $SourcePath $TargetPath -Force
            Write-Host "✅ Archivo .env actualizado en $TargetPath" -ForegroundColor Green
            return $true
        } else {
            Write-Host "ℹ️  .env ya existe en $TargetPath" -ForegroundColor Gray
            return $true
        }
    }
    
    if (-not (Test-Path $SourcePath)) {
        Write-Host "❌ Archivo .env.example no encontrado en $SourcePath" -ForegroundColor Red
        return $false
    }
    
    Copy-Item $SourcePath $TargetPath
    Write-Host "✅ Archivo .env creado en $TargetPath" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANTE: Edita $TargetPath con valores reales" -ForegroundColor Yellow
    
    return $true
}

function Initialize-BackendEnv {
    <#
    .SYNOPSIS
    Inicializa el archivo .env del backend
    .PARAMETER Force
    Si es true, sobrescribe el archivo .env existente
    #>
    param (
        [bool]$Force = $false
    )
    
    return Initialize-EnvFile -SourcePath "packages\backend\.env.example" -TargetPath "packages\backend\.env" -Force $Force
}

function Initialize-FrontendEnv {
    <#
    .SYNOPSIS
    Inicializa el archivo .env del frontend
    .PARAMETER Force
    Si es true, sobrescribe el archivo .env existente
    #>
    param (
        [bool]$Force = $false
    )
    
    if (Test-Path "packages\frontend\.env.example") {
        return Initialize-EnvFile -SourcePath "packages\frontend\.env.example" -TargetPath "packages\frontend\.env" -Force $Force
    } else {
        Write-Host "ℹ️  No se encontró .env.example en frontend" -ForegroundColor Gray
        return $true
    }
}

function Initialize-AllEnvFiles {
    <#
    .SYNOPSIS
    Inicializa todos los archivos .env del proyecto
    .PARAMETER Force
    Si es true, sobrescribe los archivos .env existentes
    #>
    param (
        [bool]$Force = $false
    )
    
    Write-Host "📝 Configurando variables de entorno..." -ForegroundColor Yellow
    Write-Host ""
    
    $backendResult = Initialize-BackendEnv -Force $Force
    $frontendResult = Initialize-FrontendEnv -Force $Force
    
    Write-Host ""
    
    return $backendResult -and $frontendResult
}

Export-ModuleMember -Function Initialize-EnvFile, Initialize-BackendEnv, Initialize-FrontendEnv, Initialize-AllEnvFiles
