# Módulo de utilidades para salida formateada
# Funciones reutilizables para mostrar información al usuario

function Write-Header {
    <#
    .SYNOPSIS
    Muestra un encabezado con formato
    .PARAMETER Title
    Título del encabezado
    .PARAMETER Color
    Color del texto (default: Cyan)
    #>
    param (
        [Parameter(Mandatory=$true)]
        [string]$Title,
        
        [string]$Color = "Cyan"
    )
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor $Color
    Write-Host " $Title" -ForegroundColor $Color
    Write-Host "========================================" -ForegroundColor $Color
    Write-Host ""
}

function Write-Section {
    <#
    .SYNOPSIS
    Muestra un título de sección
    .PARAMETER Title
    Título de la sección
    .PARAMETER Icon
    Icono emoji para la sección (opcional)
    #>
    param (
        [Parameter(Mandatory=$true)]
        [string]$Title,
        
        [string]$Icon = ""
    )
    
    Write-Host ""
    if ($Icon) {
        Write-Host "$Icon $Title" -ForegroundColor Yellow
    } else {
        Write-Host "📌 $Title" -ForegroundColor Yellow
    }
    Write-Host ""
}

function Write-Success {
    <#
    .SYNOPSIS
    Muestra un mensaje de éxito
    .PARAMETER Message
    Mensaje a mostrar
    #>
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    <#
    .SYNOPSIS
    Muestra un mensaje de error
    .PARAMETER Message
    Mensaje a mostrar
    #>
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    <#
    .SYNOPSIS
    Muestra un mensaje de advertencia
    .PARAMETER Message
    Mensaje a mostrar
    #>
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    <#
    .SYNOPSIS
    Muestra un mensaje informativo
    .PARAMETER Message
    Mensaje a mostrar
    #>
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message
    )
    
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Step {
    <#
    .SYNOPSIS
    Muestra un paso de un proceso
    .PARAMETER Message
    Mensaje a mostrar
    .PARAMETER Indent
    Nivel de indentación (default: 1)
    #>
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [int]$Indent = 1
    )
    
    $indentStr = "  " * $Indent
    Write-Host "$indentStr$Message" -ForegroundColor Cyan
}

function Write-Summary {
    <#
    .SYNOPSIS
    Muestra un resumen de resultados
    .PARAMETER Title
    Título del resumen
    .PARAMETER Items
    Hashtable con los items del resumen (clave = etiqueta, valor = texto)
    .PARAMETER Color
    Color del encabezado (default: Cyan)
    #>
    param (
        [Parameter(Mandatory=$true)]
        [string]$Title,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$Items,
        
        [string]$Color = "Cyan"
    )
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor $Color
    Write-Host " $Title" -ForegroundColor $Color
    Write-Host "========================================" -ForegroundColor $Color
    
    foreach ($key in $Items.Keys) {
        Write-Host "${key}:" -NoNewline -ForegroundColor White
        Write-Host " $($Items[$key])" -ForegroundColor Gray
    }
    
    Write-Host ""
}

function Confirm-Action {
    <#
    .SYNOPSIS
    Solicita confirmación al usuario para una acción
    .PARAMETER Message
    Mensaje de advertencia
    .PARAMETER ConfirmText
    Texto que el usuario debe escribir para confirmar (default: SI)
    #>
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [string]$ConfirmText = "SI"
    )
    
    Write-Host "⚠️  ADVERTENCIA: $Message" -ForegroundColor Red
    Write-Host ""
    $confirmation = Read-Host "¿Estás seguro de que deseas continuar? (escribe '$ConfirmText' para confirmar)"
    
    return $confirmation -eq $ConfirmText
}

Export-ModuleMember -Function Write-Header, Write-Section, Write-Success, Write-Error, Write-Warning, Write-Info, Write-Step, Write-Summary, Confirm-Action
