#!/bin/bash
# Script para resetear la base de datos y recargar datos de prueba
# ADVERTENCIA: Esto eliminará TODOS los datos y los reemplazará con datos de prueba

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${RED} ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos${NC}"
echo ""
read -p "¿Estás seguro de que deseas continuar? (escribe 'SI' para confirmar): " confirmation

if [ "$confirmation" != "SI" ]; then
    echo -e "${YELLOW} Operación cancelada${NC}"
    exit 0
fi

echo ""
echo -e "${CYAN} Reseteando base de datos...${NC}"
echo ""

# Verificar que Docker esté corriendo
if ! docker ps &> /dev/null; then
    echo -e "${RED} Docker no está corriendo${NC}"
    exit 1
fi

# Verificar que PostgreSQL esté corriendo
postgres_running=$(docker ps --filter "name=talentonet-postgres" --filter "status=running" --format "{{.Names}}")
if [ -z "$postgres_running" ]; then
    echo -e "${RED} PostgreSQL no está corriendo${NC}"
    echo -e "${YELLOW}   Ejecuta primero: pnpm docker:up${NC}"
    exit 1
fi

echo -e "${GREEN} PostgreSQL está corriendo${NC}"
echo ""

# Paso 1: Eliminar todas las tablas
echo -e "${YELLOW} Eliminando todas las tablas...${NC}"
export PGPASSWORD="talentonet_secret"

docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db > /dev/null 2>&1 << EOF
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO talentonet;
GRANT ALL ON SCHEMA public TO public;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN} Tablas eliminadas${NC}"
else
    echo -e "${RED} Error al eliminar tablas${NC}"
    exit 1
fi

echo ""

# Paso 2: Ejecutar migraciones
echo -e "${YELLOW} Ejecutando migraciones...${NC}"

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
            echo -e "   ${RED} Error en $filename${NC}"
            exit 1
        fi
    fi
done

echo -e "${GREEN} $migration_success migraciones ejecutadas${NC}"
echo ""

# Paso 3: Ejecutar seeds
echo -e "${YELLOW} Cargando datos de prueba...${NC}"
echo ""

seed_files=(
    "packages/backend/seeds/001_seed_employees.sql"
    "packages/backend/seeds/002_recruitment_data.sql"
    "packages/backend/seeds/003_affiliations_data.sql"
)

seed_success=0
for seed_file in "${seed_files[@]}"; do
    if [ -f "$seed_file" ]; then
        filename=$(basename "$seed_file")
        echo -e "   ${CYAN}Ejecutando $filename...${NC}"
        cat "$seed_file" | docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "   ${GREEN} $filename completado${NC}"
            ((seed_success++))
        fi
    fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} Base de datos reseteada exitosamente!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Datos de prueba cargados:${NC}"
echo -e "${WHITE}  • 30 empleados con contratos y afiliaciones${NC}"
echo -e "${WHITE}  • 2 vacantes abiertas (Desarrollador y RRHH)${NC}"
echo -e "${WHITE}  • 4 candidatos en diferentes estados${NC}"
echo -e "${WHITE}  • 3 entrevistas programadas/completadas${NC}"
echo -e "${WHITE}  • Proveedores de ARL, EPS, AFP y Cajas${NC}"
echo ""
echo -e "${YELLOW}Usuarios de prueba:${NC}"
echo -e "${GREEN}  Admin:  admin@talentonet.com / Password123!${NC}"
echo -e "${GREEN}  RH:     rh@talentonet.com / Password123!${NC}"
echo ""
