# Script de inicialización para Windows PowerShell - Versión Modular
# Importar módulos
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Import-Module "$ScriptPath\modules\docker-utils.psm1" -Force
Import-Module "$ScriptPath\modules\db-utils.psm1" -Force
Import-Module "$ScriptPath\modules\node-utils.psm1" -Force
Import-Module "$ScriptPath\modules\env-utils.psm1" -Force
Import-Module "$ScriptPath\modules\minio-utils.psm1" -Force
Import-Module "$ScriptPath\modules\output-utils.psm1" -Force
Import-Module "$ScriptPath\modules\workflow-utils.psm1" -Force

Write-Header "Iniciando setup de TalentoNet" -Color Cyan

# Verificar prerequisitos y servicios
if (-not (Invoke-PrerequisitesCheck -StartServices $false)) {
    exit 1
}

# Instalar dependencias
if (-not (Install-Dependencies)) {
    exit 1
}

# Configurar variables de entorno
if (-not (Initialize-AllEnvFiles)) {
    exit 1
}

# Iniciar servicios Docker
if (-not (Start-DockerServices -Services @("postgres", "rabbitmq", "minio"))) {
    exit 1
}

# Esperar a que PostgreSQL esté listo
if (-not (Wait-ForPostgres -Timeout 30)) {
    Write-Error "PostgreSQL no estuvo listo a tiempo"
    exit 1
}

# Ejecutar setup de base de datos (migraciones + seeds)
$dbResult = Invoke-DatabaseSetup -Verbose $true

if (-not $dbResult.Success) {
    Write-Warning "Hubo problemas en el setup de la base de datos"
}

# Configurar MinIO
if (-not (Initialize-MinioBucket -BucketName "talentonet-documents" -PublicRead $true)) {
    Write-Warning "Hubo un problema al configurar MinIO, pero se puede continuar"
}

# Resumen final
Write-Header "Setup completado exitosamente!" -Color Green

Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Inicia el servidor de desarrollo:"
Write-Host "   pnpm dev" -ForegroundColor Green
Write-Host ""
Write-Host "2. Accede a las aplicaciones:"
Write-Host "   Frontend:        http://localhost:5173" -ForegroundColor Green
Write-Host "   Backend API:     http://localhost:3000" -ForegroundColor Green
Write-Host "   API Docs:        http://localhost:3000/api/docs" -ForegroundColor Green
Write-Host "   RabbitMQ UI:     http://localhost:15672 (guest/guest)" -ForegroundColor Green
Write-Host "   MinIO Console:   http://localhost:9001 (minioadmin/minioadmin)" -ForegroundColor Green
Write-Host ""
Write-Host "3. Usuarios de prueba:"
Write-Host "   Admin:   admin@talentonet.com / Password123!" -ForegroundColor Green
Write-Host "   RH:      rh@talentonet.com / Password123!" -ForegroundColor Green
Write-Host ""
Write-Host "Para detener los servicios:" -ForegroundColor Yellow
Write-Host "   pnpm docker:down" -ForegroundColor Green
Write-Host ""
Write-Host "Documentación completa en: README.md" -ForegroundColor Yellow
Write-Host ""
