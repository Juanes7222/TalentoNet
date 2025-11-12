# Módulo de utilidades para PostgreSQL
# Funciones reutilizables para gestionar la base de datos

function Invoke-SqlFile {
    <#
    .SYNOPSIS
    Ejecuta un archivo SQL en la base de datos PostgreSQL
    .PARAMETER FilePath
    Ruta completa del archivo SQL a ejecutar
    .PARAMETER ContainerName
    Nombre del contenedor PostgreSQL (default: talentonet-postgres)
    .PARAMETER Database
    Nombre de la base de datos (default: talentonet_db)
    .PARAMETER User
    Usuario de PostgreSQL (default: talentonet)
    .PARAMETER Silent
    Si es true, suprime la salida del comando
    #>
    param (
        [Parameter(Mandatory=$true)]
        [string]$FilePath,
        
        [string]$ContainerName = "talentonet-postgres",
        [string]$Database = "talentonet_db",
        [string]$User = "talentonet",
        [bool]$Silent = $true
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "❌ Archivo no encontrado: $FilePath" -ForegroundColor Red
        return $false
    }
    
    $env:PGPASSWORD = "talentonet_secret"
    
    if ($Silent) {
        Get-Content $FilePath | docker exec -i $ContainerName psql -U $User -d $Database 2>&1 | Out-Null
    } else {
        Get-Content $FilePath | docker exec -i $ContainerName psql -U $User -d $Database
    }
    
    return $LASTEXITCODE -eq 0
}

function Invoke-SqlCommand {
    <#
    .SYNOPSIS
    Ejecuta un comando SQL directo en PostgreSQL
    .PARAMETER Command
    Comando SQL a ejecutar
    .PARAMETER ContainerName
    Nombre del contenedor PostgreSQL (default: talentonet-postgres)
    .PARAMETER Database
    Nombre de la base de datos (default: talentonet_db)
    .PARAMETER User
    Usuario de PostgreSQL (default: talentonet)
    .PARAMETER Silent
    Si es true, suprime la salida del comando
    #>
    param (
        [Parameter(Mandatory=$true)]
        [string]$Command,
        
        [string]$ContainerName = "talentonet-postgres",
        [string]$Database = "talentonet_db",
        [string]$User = "talentonet",
        [bool]$Silent = $true
    )
    
    $env:PGPASSWORD = "talentonet_secret"
    
    if ($Silent) {
        docker exec -i $ContainerName psql -U $User -d $Database -c $Command 2>&1 | Out-Null
    } else {
        docker exec -i $ContainerName psql -U $User -d $Database -c $Command
    }
    
    return $LASTEXITCODE -eq 0
}

function Invoke-Migrations {
    <#
    .SYNOPSIS
    Ejecuta todas las migraciones SQL en orden
    .PARAMETER MigrationsPath
    Ruta al directorio de migraciones (default: packages\backend\migrations)
    .PARAMETER Verbose
    Si es true, muestra mensajes detallados
    #>
    param (
        [string]$MigrationsPath = "packages\backend\migrations",
        [bool]$Verbose = $true
    )
    
    if ($Verbose) {
        Write-Host "📋 Ejecutando migraciones de base de datos..." -ForegroundColor Yellow
    }
    
    $migrationFiles = Get-ChildItem "$MigrationsPath\*.sql" | Sort-Object Name
    
    if ($migrationFiles.Count -eq 0) {
        Write-Host "⚠️  No se encontraron archivos de migración en $MigrationsPath" -ForegroundColor Yellow
        return @{ Success = 0; Failed = 0; Total = 0 }
    }
    
    $migrationSuccess = 0
    $migrationFailed = 0
    
    foreach ($migration in $migrationFiles) {
        $fileName = $migration.Name
        
        if ($Verbose) {
            Write-Host "  Ejecutando $fileName..." -ForegroundColor Cyan
        }
        
        $result = Invoke-SqlFile -FilePath $migration.FullName -Silent $true
        
        if ($result) {
            $migrationSuccess++
            if ($Verbose) {
                Write-Host "    ✅ $fileName completado" -ForegroundColor Green
            }
        } else {
            $migrationFailed++
            if ($Verbose) {
                Write-Host "    ⚠️  Error en $fileName (puede ser que ya exista)" -ForegroundColor Yellow
            }
        }
    }
    
    if ($Verbose) {
        Write-Host "✅ $migrationSuccess migraciones ejecutadas" -ForegroundColor Green
        if ($migrationFailed -gt 0) {
            Write-Host "⚠️  $migrationFailed migraciones con errores" -ForegroundColor Yellow
        }
    }
    
    return @{
        Success = $migrationSuccess
        Failed = $migrationFailed
        Total = $migrationFiles.Count
    }
}

function Invoke-Seeds {
    <#
    .SYNOPSIS
    Ejecuta archivos de seed en orden específico
    .PARAMETER SeedFiles
    Array de rutas de archivos seed a ejecutar en orden
    .PARAMETER ShowDetails
    Si es true, muestra mensajes detallados
    #>
    param (
        [Parameter(Mandatory=$true)]
        [string[]]$SeedFiles,
        
        [bool]$ShowDetails = $true
    )
    
    if ($ShowDetails) {
        Write-Host "🌱 Cargando datos de prueba..." -ForegroundColor Yellow
    }
    
    $seedSuccess = 0
    $seedFailed = 0
    $totalSeeds = $SeedFiles.Count
    
    foreach ($seedFile in $SeedFiles) {
        $fileName = Split-Path $seedFile -Leaf
        
        if (Test-Path $seedFile) {
            if ($ShowDetails) {
                Write-Host "  Ejecutando $fileName..." -ForegroundColor Cyan
            }
            
            $result = Invoke-SqlFile -FilePath $seedFile -Silent $true
            
            if ($result) {
                $seedSuccess++
                if ($ShowDetails) {
                    Write-Host "    ✅ $fileName completado" -ForegroundColor Green
                }
            } else {
                $seedFailed++
                if ($ShowDetails) {
                    Write-Host "    ⚠️  $fileName ejecutado con advertencias" -ForegroundColor Yellow
                }
            }
        } else {
            $seedFailed++
            if ($ShowDetails) {
                Write-Host "    ❌ Archivo no encontrado: $fileName" -ForegroundColor Red
            }
        }
    }
    
    if ($ShowDetails) {
        Write-Host "✅ Seeds completados: $seedSuccess/$totalSeeds" -ForegroundColor Green
        if ($seedFailed -gt 0) {
            Write-Host "⚠️  Seeds con advertencias: $seedFailed/$totalSeeds" -ForegroundColor Yellow
        }
    }
    
    return @{
        Success = $seedSuccess
        Failed = $seedFailed
        Total = $totalSeeds
    }
}

function Reset-Database {
    <#
    .SYNOPSIS
    Elimina todas las tablas y recrea el esquema
    .PARAMETER Verbose
    Si es true, muestra mensajes detallados
    #>
    param (
        [bool]$Verbose = $true
    )
    
    if ($Verbose) {
        Write-Host "🗑️  Eliminando todas las tablas..." -ForegroundColor Yellow
    }
    
    $dropCommand = @"
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO talentonet;
GRANT ALL ON SCHEMA public TO public;
"@
    
    $result = Invoke-SqlCommand -Command $dropCommand -Silent $true
    
    if ($result) {
        if ($Verbose) {
            Write-Host "✅ Tablas eliminadas y esquema recreado" -ForegroundColor Green
        }
        return $true
    } else {
        if ($Verbose) {
            Write-Host "❌ Error al resetear la base de datos" -ForegroundColor Red
        }
        return $false
    }
}

function Wait-ForPostgres {
    <#
    .SYNOPSIS
    Espera a que PostgreSQL esté listo para aceptar conexiones
    .PARAMETER Timeout
    Tiempo máximo de espera en segundos (default: 30)
    .PARAMETER CheckInterval
    Intervalo entre verificaciones en segundos (default: 2)
    #>
    param (
        [int]$Timeout = 30,
        [int]$CheckInterval = 2
    )
    
    Write-Host "⏳ Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
    
    $elapsed = 0
    while ($elapsed -lt $Timeout) {
        $result = Invoke-SqlCommand -Command "SELECT 1;" -Silent $true
        
        if ($result) {
            Write-Host "✅ PostgreSQL está listo" -ForegroundColor Green
            return $true
        }
        
        Start-Sleep -Seconds $CheckInterval
        $elapsed += $CheckInterval
    }
    
    Write-Host "❌ PostgreSQL no estuvo listo en $Timeout segundos" -ForegroundColor Red
    return $false
}

function Get-SeedFiles {
    <#
    .SYNOPSIS
    Obtiene automáticamente todos los archivos de seed en orden
    .PARAMETER SeedsPath
    Ruta al directorio de seeds (default: packages\backend\seeds)
    .PARAMETER Pattern
    Patrón de archivos a buscar (default: *.sql)
    #>
    param (
        [string]$SeedsPath = "packages\backend\seeds",
        [string]$Pattern = "*.sql"
    )
    
    if (-not (Test-Path $SeedsPath)) {
        Write-Host "⚠️  Directorio de seeds no encontrado: $SeedsPath" -ForegroundColor Yellow
        return @()
    }
    
    $seedFiles = Get-ChildItem "$SeedsPath\$Pattern" | Sort-Object Name
    
    if ($seedFiles.Count -eq 0) {
        Write-Host "⚠️  No se encontraron archivos de seed en $SeedsPath" -ForegroundColor Yellow
        return @()
    }
    
    return $seedFiles | ForEach-Object { $_.FullName }
}

Export-ModuleMember -Function Invoke-SqlFile, Invoke-SqlCommand, Invoke-Migrations, Invoke-Seeds, Reset-Database, Wait-ForPostgres, Get-SeedFiles
