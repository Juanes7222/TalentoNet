#!/bin/bash

# Script de inicialización completa del proyecto TalentoNet
# Ejecutar desde la raíz del repositorio

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN} Iniciando setup de TalentoNet...${NC}"
echo ""

# Verificar prerequisitos
echo -e "${YELLOW} Verificando prerequisitos...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED} Node.js no está instalado. Instala Node.js >= 20.0.0${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW} pnpm no encontrado. Instalando...${NC}"
    npm install -g pnpm
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED} Docker no está instalado${NC}"
    exit 1
fi

# Verificar que Docker esté corriendo
if ! docker ps &> /dev/null; then
    echo -e "${RED} Docker no está corriendo.${NC}"
    echo -e "${YELLOW}   Por favor:${NC}"
    echo -e "${YELLOW}   1. Inicia Docker${NC}"
    echo -e "${YELLOW}   2. Presiona Enter para continuar...${NC}"
    read -r
    
    # Verificar nuevamente
    if ! docker ps &> /dev/null; then
        echo -e "${RED} Docker aún no está listo. Abortando.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN} Prerequisitos verificados${NC}"
echo ""

# Instalar dependencias
echo -e "${CYAN} Instalando dependencias...${NC}"
if [ -f "pnpm-lock.yaml" ]; then
    pnpm install --frozen-lockfile
else
    echo -e "${YELLOW} pnpm-lock.yaml no encontrado, generando...${NC}"
    pnpm install
fi

# Configurar variables de entorno
echo -e "${YELLOW} Configurando variables de entorno...${NC}"

if [ ! -f "packages/backend/.env" ]; then
    cp packages/backend/.env.example packages/backend/.env
    echo -e "${GREEN} Archivo .env creado en backend${NC}"
    echo -e "${YELLOW} IMPORTANTE: Edita packages/backend/.env con valores reales${NC}"
else
    echo -e "${GREEN} .env ya existe en backend${NC}"
fi

# Iniciar servicios con Docker Compose
echo -e "${YELLOW} Iniciando servicios Docker (PostgreSQL, RabbitMQ, MinIO)...${NC}"
docker compose -f infra/docker-compose.yml up -d postgres rabbitmq minio

echo -e "${YELLOW} Esperando a que PostgreSQL esté listo...${NC}"
sleep 10

# Ejecutar migraciones
echo -e "${YELLOW} Ejecutando migraciones de base de datos...${NC}"
export PGPASSWORD="talentonet_secret"

# Obtener todas las migraciones en orden
migration_files=(packages/backend/migrations/*.sql)

migration_success=0
for migration in "${migration_files[@]}"; do
    if [ -f "$migration" ]; then
        filename=$(basename "$migration")
        echo -e "   ${CYAN}Ejecutando $filename...${NC}"
        
        cat "$migration" | docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            ((migration_success++))
        else
            echo -e "   ${YELLOW}⚠️ Error en $filename (puede ser que ya exista)${NC}"
        fi
    fi
done

echo -e "${GREEN} $migration_success migraciones ejecutadas${NC}"
echo ""

# Ejecutar seeds en orden
echo -e "${YELLOW} Cargando datos de prueba (seeds)...${NC}"

seed_files=(
    "packages/backend/seeds/001_seed_employees.sql"
    "packages/backend/seeds/002_recruitment_data.sql"
    "packages/backend/seeds/003_affiliations_data.sql"
    "packages/backend/seeds/004_seed_payroll.sql"
)

seed_success=0
seed_errors=0
total_seeds=${#seed_files[@]}

for seed_file in "${seed_files[@]}"; do
    if [ -f "$seed_file" ]; then
        filename=$(basename "$seed_file")
        echo -e "   ${CYAN}Ejecutando $filename...${NC}"
        
        # Ejecutar sin detener el script si falla
        if cat "$seed_file" | docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db > /dev/null 2>&1; then
            echo -e "   ${GREEN} $filename completado${NC}"
            ((seed_success++))
        else
            echo -e "   ${YELLOW} Error en $filename (puede ser que ya existan datos)${NC}"
            ((seed_errors++))
        fi
    else
        echo -e "   ${YELLOW} Archivo no encontrado: $filename${NC}"
        ((seed_errors++))
    fi
done

echo ""
if [ $seed_success -gt 0 ]; then
    echo -e "${GREEN} Seeds completados: $seed_success/$total_seeds${NC}"
fi
if [ $seed_errors -gt 0 ]; then
    echo -e "${YELLOW} Seeds con advertencias: $seed_errors/$total_seeds${NC}"
fi

# Crear bucket en MinIO
echo -e "${YELLOW} Configurando bucket en MinIO...${NC}"
docker exec talentonet-minio mc alias set local http://localhost:9000 minioadmin minioadmin > /dev/null 2>&1
docker exec talentonet-minio mc mb local/talentonet-documents > /dev/null 2>&1
docker exec talentonet-minio mc anonymous set download local/talentonet-documents > /dev/null 2>&1

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} Setup completado exitosamente!${NC}"
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
