#!/bin/bash

# Script de inicialización completa del proyecto TalentoNet
# Ejecutar desde la raíz del repositorio

set -e

echo "🚀 Iniciando setup de TalentoNet..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar prerequisitos
echo -e "${YELLOW}Verificando prerequisitos...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado. Instala Node.js >= 20.0.0${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm no encontrado. Instalando...${NC}"
    npm install -g pnpm
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisitos verificados${NC}"

# Instalar dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
pnpm install --frozen-lockfile

# Configurar variables de entorno
echo -e "${YELLOW}🔧 Configurando variables de entorno...${NC}"

if [ ! -f packages/backend/.env ]; then
    cp packages/backend/.env.example packages/backend/.env
    echo -e "${GREEN}✅ Archivo .env creado en backend${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edita packages/backend/.env con valores reales${NC}"
else
    echo -e "${GREEN}✅ .env ya existe en backend${NC}"
fi

# Iniciar servicios con Docker Compose
echo -e "${YELLOW}🐳 Iniciando servicios Docker (PostgreSQL, RabbitMQ, MinIO)...${NC}"
docker-compose -f infra/docker-compose.yml up -d postgres rabbitmq minio

echo -e "${YELLOW}⏳ Esperando a que PostgreSQL esté listo...${NC}"
sleep 10

# Ejecutar migraciones
echo -e "${YELLOW}🗄️  Ejecutando migraciones de base de datos...${NC}"
cd packages/backend
pnpm migration:run || echo -e "${YELLOW}⚠️  Migraciones fallaron (puede ser normal si ya están aplicadas)${NC}"
cd ../..

# Ejecutar seeds
echo -e "${YELLOW}🌱 Cargando datos de prueba (seed)...${NC}"
cd packages/backend
pnpm seed:run || echo -e "${YELLOW}⚠️  Seed falló (puede ser normal si ya se ejecutó)${NC}"
cd ../..

# Crear bucket en MinIO
echo -e "${YELLOW}🪣 Configurando bucket en MinIO...${NC}"
docker exec talentonet-minio mc alias set local http://localhost:9000 minioadmin minioadmin || true
docker exec talentonet-minio mc mb local/talentonet-documents || echo -e "${YELLOW}⚠️  Bucket ya existe${NC}"
docker exec talentonet-minio mc anonymous set download local/talentonet-documents || true

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup completado exitosamente!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo ""
echo "1. Inicia el servidor de desarrollo:"
echo -e "   ${GREEN}pnpm dev${NC}"
echo ""
echo "2. Accede a las aplicaciones:"
echo -e "   ${GREEN}Frontend:${NC}        http://localhost:5173"
echo -e "   ${GREEN}Backend API:${NC}     http://localhost:3000"
echo -e "   ${GREEN}API Docs:${NC}        http://localhost:3000/api/docs"
echo -e "   ${GREEN}RabbitMQ UI:${NC}     http://localhost:15672 (guest/guest)"
echo -e "   ${GREEN}MinIO Console:${NC}   http://localhost:9001 (minioadmin/minioadmin)"
echo ""
echo "3. Usuarios de prueba:"
echo -e "   ${GREEN}Admin:${NC}   admin@talentonet.com / Password123!"
echo -e "   ${GREEN}RH:${NC}      rh@talentonet.com / Password123!"
echo ""
echo -e "${YELLOW}Para detener los servicios:${NC}"
echo -e "   ${GREEN}pnpm docker:down${NC}"
echo ""
echo -e "${YELLOW}Documentación completa en:${NC} README.md"
echo ""
