# Módulo de utilidades para MinIO
# Funciones reutilizables para gestionar MinIO

function Initialize-MinioBucket {
    <#
    .SYNOPSIS
    Crea y configura el bucket de MinIO
    .PARAMETER BucketName
    Nombre del bucket a crear (default: talentonet-documents)
    .PARAMETER ContainerName
    Nombre del contenedor MinIO (default: talentonet-minio)
    .PARAMETER Endpoint
    Endpoint de MinIO (default: http://localhost:9000)
    .PARAMETER AccessKey
    Access Key de MinIO (default: minioadmin)
    .PARAMETER SecretKey
    Secret Key de MinIO (default: minioadmin)
    .PARAMETER PublicRead
    Si es true, configura el bucket para lectura pública (default: true)
    #>
    param (
        [string]$BucketName = "talentonet-documents",
        [string]$ContainerName = "talentonet-minio",
        [string]$Endpoint = "http://localhost:9000",
        [string]$AccessKey = "minioadmin",
        [string]$SecretKey = "minioadmin",
        [bool]$PublicRead = $true
    )
    
    Write-Host "🪣 Configurando bucket en MinIO..." -ForegroundColor Yellow
    
    # Configurar alias
    Write-Host "  Configurando alias de MinIO..." -ForegroundColor Gray
    docker exec $ContainerName mc alias set local $Endpoint $AccessKey $SecretKey 2>&1 | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al configurar alias de MinIO" -ForegroundColor Red
        return $false
    }
    
    # Crear bucket
    Write-Host "  Creando bucket '$BucketName'..." -ForegroundColor Gray
    docker exec $ContainerName mc mb local/$BucketName 2>&1 | Out-Null
    
    # Puede fallar si el bucket ya existe, verificamos
    $bucketExists = docker exec $ContainerName mc ls local | Select-String -Pattern $BucketName -Quiet
    
    if (-not $bucketExists) {
        Write-Host "❌ Error al crear bucket" -ForegroundColor Red
        return $false
    }
    
    # Configurar permisos si es público
    if ($PublicRead) {
        Write-Host "  Configurando permisos de lectura pública..." -ForegroundColor Gray
        docker exec $ContainerName mc anonymous set download local/$BucketName 2>&1 | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Advertencia: No se pudo configurar lectura pública" -ForegroundColor Yellow
        }
    }
    
    Write-Host "✅ Bucket de MinIO configurado correctamente" -ForegroundColor Green
    return $true
}

function Test-MinIOReady {
    <#
    .SYNOPSIS
    Verifica si MinIO está listo y responde
    .PARAMETER ContainerName
    Nombre del contenedor MinIO (default: talentonet-minio)
    #>
    param (
        [string]$ContainerName = "talentonet-minio"
    )
    
    try {
        docker exec $ContainerName mc --version 2>&1 | Out-Null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

Export-ModuleMember -Function Initialize-MinioBucket, Test-MinIOReady
