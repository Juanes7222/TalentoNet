#!/bin/bash#!/bin/bash

# Script de inicialización para Linux/macOS

# Script de inicialización completa del proyecto TalentoNet

set -e  # Exit on error# Ejecutar desde la raíz del repositorio



# Colorsset -e

RED='\033[0;31m'

GREEN='\033[0;32m'echo "Iniciando setup de TalentoNet..."

YELLOW='\033[1;33m'

CYAN='\033[0;36m'# Colores para output

NC='\033[0m' # No ColorRED='\033[0;31m'

GREEN='\033[0;32m'

echo -e "${CYAN}🚀 Iniciando setup de TalentoNet...${NC}"YELLOW='\033[1;33m'

echo ""NC='\033[0m' # No Color



# Verificar prerequisitos# Verificar prerequisitos

echo -e "${YELLOW}Verificando prerequisitos...${NC}"echo -e "${YELLOW}Verificando prerequisitos...${NC}"



if ! command -v node &> /dev/null; thenif ! command -v node &> /dev/null; then

    echo -e "${RED}❌ Node.js no está instalado. Instala Node.js >= 20.0.0${NC}"    echo -e "${RED}❌ Node.js no está instalado. Instala Node.js >= 20.0.0${NC}"

    exit 1    exit 1

fifi



if ! command -v pnpm &> /dev/null; thenif ! command -v pnpm &> /dev/null; then

    echo -e "${YELLOW}⚠️ pnpm no encontrado. Instalando...${NC}"    echo -e "${YELLOW} pnpm no encontrado. Instalando...${NC}"

    npm install -g pnpm    npm install -g pnpm

fifi



if ! command -v docker &> /dev/null; thenif ! command -v docker &> /dev/null; then

    echo -e "${RED}❌ Docker no está instalado${NC}"    echo -e "${RED}❌ Docker no está instalado${NC}"

    exit 1    exit 1

fifi



# Verificar que Docker esté corriendoecho -e "${GREEN} Prerequisitos verificados${NC}"

if ! docker ps &> /dev/null; then

    echo -e "${RED}❌ Docker no está corriendo.${NC}"# Instalar dependencias

    echo -e "${YELLOW}   Por favor:${NC}"echo -e "${YELLOW} Instalando dependencias...${NC}"

    echo -e "${YELLOW}   1. Inicia Docker${NC}"pnpm install --frozen-lockfile

    echo -e "${YELLOW}   2. Presiona Enter para continuar...${NC}"

    read -r# Configurar variables de entorno

    echo -e "${YELLOW} Configurando variables de entorno...${NC}"

    # Verificar nuevamente

    if ! docker ps &> /dev/null; thenif [ ! -f packages/backend/.env ]; then

        echo -e "${RED}❌ Docker aún no está listo. Abortando.${NC}"    cp packages/backend/.env.example packages/backend/.env

        exit 1    echo -e "${GREEN} Archivo .env creado en backend${NC}"

    fi    echo -e "${YELLOW}  IMPORTANTE: Edita packages/backend/.env con valores reales${NC}"

fielse

    echo -e "${GREEN} .env ya existe en backend${NC}"

echo -e "${GREEN}✅ Prerequisitos verificados${NC}"fi

echo ""

# Iniciar servicios con Docker Compose

# Instalar dependenciasecho -e "${YELLOW} Iniciando servicios Docker (PostgreSQL, RabbitMQ, MinIO)...${NC}"

echo -e "${CYAN}📦 Instalando dependencias...${NC}"docker-compose -f infra/docker-compose.yml up -d postgres rabbitmq minio

if [ -f "pnpm-lock.yaml" ]; then

    pnpm install --frozen-lockfileecho -e "${YELLOW} Esperando a que PostgreSQL esté listo...${NC}"

elsesleep 10

    echo -e "${YELLOW}⚠️ pnpm-lock.yaml no encontrado, generando...${NC}"

    pnpm install# Ejecutar migraciones

fiecho -e "${YELLOW}  Ejecutando migraciones de base de datos...${NC}"

cd packages/backend

# Configurar variables de entornopnpm migration:run || echo -e "${YELLOW}  Migraciones fallaron (puede ser normal si ya están aplicadas)${NC}"

echo -e "${YELLOW}🔧 Configurando variables de entorno...${NC}"cd ../..



if [ ! -f "packages/backend/.env" ]; then# Ejecutar seeds

    cp packages/backend/.env.example packages/backend/.envecho -e "${YELLOW} Cargando datos de prueba (seed)...${NC}"

    echo -e "${GREEN}✅ Archivo .env creado en backend${NC}"cd packages/backend

    echo -e "${YELLOW}⚠️ IMPORTANTE: Edita packages/backend/.env con valores reales${NC}"pnpm seed:run || echo -e "${YELLOW}  Seed falló (puede ser normal si ya se ejecutó)${NC}"

elsecd ../..

    echo -e "${GREEN}✅ .env ya existe en backend${NC}"

fi# Crear bucket en MinIO

echo -e "${YELLOW} Configurando bucket en MinIO...${NC}"

# Iniciar servicios con Docker Composedocker exec talentonet-minio mc alias set local http://localhost:9000 minioadmin minioadmin || true

echo -e "${YELLOW}🐳 Iniciando servicios Docker (PostgreSQL, RabbitMQ, MinIO)...${NC}"docker exec talentonet-minio mc mb local/talentonet-documents || echo -e "${YELLOW} Bucket ya existe${NC}"

docker-compose -f infra/docker-compose.yml up -d postgres rabbitmq miniodocker exec talentonet-minio mc anonymous set download local/talentonet-documents || true



echo -e "${YELLOW}⏳ Esperando a que PostgreSQL esté listo...${NC}"echo ""

sleep 10echo -e "${GREEN}========================================${NC}"

echo -e "${GREEN}  Setup completado exitosamente!${NC}"

# Ejecutar migracionesecho -e "${GREEN}========================================${NC}"

echo -e "${YELLOW}🗄️ Ejecutando migraciones de base de datos...${NC}"echo ""

export PGPASSWORD="talentonet_secret"echo -e "${YELLOW}Próximos pasos:${NC}"

echo ""

cat packages/backend/migrations/001_initial_schema.sql | docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db > /dev/null 2>&1echo "1. Inicia el servidor de desarrollo:"

if [ $? -eq 0 ]; thenecho -e "   ${GREEN}pnpm dev${NC}"

    echo -e "${GREEN}✅ Migraciones ejecutadas${NC}"echo ""

elseecho "2. Accede a las aplicaciones:"

    echo -e "${YELLOW}⚠️ Error en migraciones (puede ser que ya existan)${NC}"echo -e "   ${GREEN}Frontend:${NC}        http://localhost:5173"

fiecho -e "   ${GREEN}Backend API:${NC}     http://localhost:3000"

echo -e "   ${GREEN}API Docs:${NC}        http://localhost:3000/api/docs"

# Ejecutar seeds en ordenecho -e "   ${GREEN}RabbitMQ UI:${NC}     http://localhost:15672 (guest/guest)"

echo -e "${YELLOW}🌱 Cargando datos de prueba (seeds)...${NC}"echo -e "   ${GREEN}MinIO Console:${NC}   http://localhost:9001 (minioadmin/minioadmin)"

echo ""

seed_files=(echo "3. Usuarios de prueba:"

    "packages/backend/seeds/001_seed_employees.sql"echo -e "   ${GREEN}Admin:${NC}   admin@talentonet.com / Password123!"

    "packages/backend/seeds/002_recruitment_data.sql"echo -e "   ${GREEN}RH:${NC}      rh@talentonet.com / Password123!"

    "packages/backend/seeds/003_affiliations_data.sql"echo ""

)echo -e "${YELLOW}Para detener los servicios:${NC}"

echo -e "   ${GREEN}pnpm docker:down${NC}"

seed_success=0echo ""

seed_errors=0echo -e "${YELLOW}Documentación completa en:${NC} README.md"

total_seeds=${#seed_files[@]}echo ""


for seed_file in "${seed_files[@]}"; do
    if [ -f "$seed_file" ]; then
        filename=$(basename "$seed_file")
        echo -e "   ${CYAN}Ejecutando $filename...${NC}"
        
        cat "$seed_file" | docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "   ${GREEN}✅ $filename completado${NC}"
            ((seed_success++))
        else
            echo -e "   ${YELLOW}⚠️ Error en $filename (puede ser que ya existan datos)${NC}"
            ((seed_errors++))
        fi
    else
        echo -e "   ${YELLOW}⚠️ Archivo no encontrado: $filename${NC}"
        ((seed_errors++))
    fi
done

echo ""
if [ $seed_success -gt 0 ]; then
    echo -e "${GREEN}✅ Seeds completados: $seed_success/$total_seeds${NC}"
fi
if [ $seed_errors -gt 0 ]; then
    echo -e "${YELLOW}⚠️ Seeds con advertencias: $seed_errors/$total_seeds${NC}"
fi

# Crear bucket en MinIO
echo -e "${YELLOW}🪣 Configurando bucket en MinIO...${NC}"
docker exec talentonet-minio mc alias set local http://localhost:9000 minioadmin minioadmin > /dev/null 2>&1
docker exec talentonet-minio mc mb local/talentonet-documents > /dev/null 2>&1
docker exec talentonet-minio mc anonymous set download local/talentonet-documents > /dev/null 2>&1

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
echo -e "   ${GREEN}Frontend:        http://localhost:5173${NC}"
echo -e "   ${GREEN}Backend API:     http://localhost:3000${NC}"
echo -e "   ${GREEN}API Docs:        http://localhost:3000/api/docs${NC}"
echo -e "   ${GREEN}RabbitMQ UI:     http://localhost:15672 (guest/guest)${NC}"
echo -e "   ${GREEN}MinIO Console:   http://localhost:9001 (minioadmin/minioadmin)${NC}"
echo ""
echo "3. Usuarios de prueba:"
echo -e "   ${GREEN}Admin:   admin@talentonet.com / Password123!${NC}"
echo -e "   ${GREEN}RH:      rh@talentonet.com / Password123!${NC}"
echo ""
echo -e "${YELLOW}Para detener los servicios:${NC}"
echo -e "   ${GREEN}pnpm docker:down${NC}"
echo ""
echo -e "${YELLOW}Documentación completa en: README.md${NC}"
echo ""
