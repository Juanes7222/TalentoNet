# Script de ejemplo personalizado usando módulos
# Este archivo muestra cómo crear tus propios scripts usando los módulos

# Importar módulos necesarios
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Import-Module "$ScriptPath\modules\docker-utils.psm1" -Force
Import-Module "$ScriptPath\modules\db-utils.psm1" -Force
Import-Module "$ScriptPath\modules\output-utils.psm1" -Force

# Ejemplo: Script para verificar el estado del sistema
Write-Header "Estado del Sistema TalentoNet" -Color Cyan

# Verificar Docker
Write-Section "Verificando Docker" -Icon "🐳"
if (Test-DockerRunning) {
    Write-Success "Docker Desktop está corriendo"
} else {
    Write-Error "Docker Desktop no está corriendo"
    exit 1
}

# Verificar contenedores
Write-Section "Verificando Contenedores" -Icon "📦"
$containers = @("talentonet-postgres", "talentonet-rabbitmq", "talentonet-minio")

foreach ($container in $containers) {
    if (Test-ContainerRunning -ContainerName $container) {
        Write-Success "$container está corriendo"
    } else {
        Write-Warning "$container no está corriendo"
    }
}

# Verificar conectividad de PostgreSQL
Write-Section "Verificando PostgreSQL" -Icon "🗄️"
if (Test-ContainerRunning -ContainerName "talentonet-postgres") {
    $sqlTest = Invoke-SqlCommand -Command "SELECT version();" -Silent $false
    if ($sqlTest) {
        Write-Success "PostgreSQL responde correctamente"
    } else {
        Write-Error "PostgreSQL no responde"
    }
}

Write-Header "Verificación completada" -Color Green
