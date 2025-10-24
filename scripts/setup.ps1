# Script de inicialización para Windows PowerShell

Write-Host "🚀 Iniciando setup de TalentoNet..." -ForegroundColor Cyan

# Verificar prerequisitos
Write-Host "Verificando prerequisitos..." -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js no está instalado. Instala Node.js >= 20.0.0" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️ pnpm no encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g pnpm
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker no está instalado" -ForegroundColor Red
    exit 1
}

# Verificar que Docker Desktop esté corriendo
$dockerRunning = $false
try {
    docker ps *>$null
    $dockerRunning = $LASTEXITCODE -eq 0
} catch {
    $dockerRunning = $false
}

if (-not $dockerRunning) {
    Write-Host "❌ Docker Desktop no está corriendo." -ForegroundColor Red
    Write-Host "   Por favor:" -ForegroundColor Yellow
    Write-Host "   1. Abre Docker Desktop" -ForegroundColor Yellow
    Write-Host "   2. Espera a que el icono esté verde" -ForegroundColor Yellow
    Write-Host "   3. Presiona Enter para continuar..." -ForegroundColor Yellow
    Read-Host
    
    # Verificar nuevamente
    try {
        docker ps *>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Docker Desktop aún no está listo. Abortando." -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Docker Desktop aún no está listo. Abortando." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Prerequisitos verificados" -ForegroundColor Green

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Cyan
if (Test-Path "pnpm-lock.yaml") {
    pnpm install --frozen-lockfile
} else {
    Write-Host "⚠️ pnpm-lock.yaml no encontrado, generando..." -ForegroundColor Yellow
    pnpm install
}

# Configurar variables de entorno
Write-Host "🔧 Configurando variables de entorno..." -ForegroundColor Yellow

if (-not (Test-Path packages\backend\.env)) {
    Copy-Item packages\backend\.env.example packages\backend\.env
    Write-Host "✅ Archivo .env creado en backend" -ForegroundColor Green
    Write-Host "⚠️ IMPORTANTE: Edita packages\backend\.env con valores reales" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env ya existe en backend" -ForegroundColor Green
}

# Iniciar servicios con Docker Compose
Write-Host "🐳 Iniciando servicios Docker (PostgreSQL, RabbitMQ, MinIO)..." -ForegroundColor Yellow
docker-compose -f infra\docker-compose.yml up -d postgres rabbitmq minio

Write-Host "⏳ Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Ejecutar migraciones
Write-Host "🗄️ Ejecutando migraciones de base de datos..." -ForegroundColor Yellow
$env:PGPASSWORD = "talentonet_secret"
Get-Content packages\backend\migrations\001_initial_schema.sql | docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migraciones ejecutadas" -ForegroundColor Green
} else {
    Write-Host "⚠️ Error en migraciones (puede ser que ya existan)" -ForegroundColor Yellow
}

# Ejecutar seeds
Write-Host "🌱 Cargando datos de prueba (seed)..." -ForegroundColor Yellow
Get-Content packages\backend\seeds\001_seed_employees.sql | docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Seeds ejecutados" -ForegroundColor Green
} else {
    Write-Host "⚠️ Error en seeds (puede ser que ya existan datos)" -ForegroundColor Yellow
}

# Crear bucket en MinIO
Write-Host "🪣 Configurando bucket en MinIO..." -ForegroundColor Yellow
docker exec talentonet-minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec talentonet-minio mc mb local/talentonet-documents
docker exec talentonet-minio mc anonymous set download local/talentonet-documents

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Setup completado exitosamente!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
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
