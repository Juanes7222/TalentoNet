#!/bin/bash
# Script para cargar datos de prueba en TalentoNet
# Ejecuta todos los archivos SQL de seeds en orden

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${CYAN} Cargando datos de prueba en TalentoNet...${NC}"
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

# Lista de archivos seed en orden
seed_files=(
    "packages/backend/seeds/001_seed_employees.sql"
    "packages/backend/seeds/002_recruitment_data.sql"
    "packages/backend/seeds/003_affiliations_data.sql"
)

seed_success=0
seed_errors=0
total_seeds=${#seed_files[@]}

echo -e "${YELLOW} Ejecutando $total_seeds archivos de seed...${NC}"
echo ""

export PGPASSWORD="talentonet_secret"

for seed_file in "${seed_files[@]}"; do
    filename=$(basename "$seed_file")
    
    if [ -f "$seed_file" ]; then
        echo -e "${CYAN} Ejecutando $filename...${NC}"
        
        # Ejecutar el seed
        cat "$seed_file" | docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "  ${GREEN} $filename completado exitosamente${NC}"
            ((seed_success++))
        else
            echo -e "  ${YELLOW} $filename ejecutado con advertencias (puede ser que ya existan datos)${NC}"
            ((seed_errors++))
        fi
    else
        echo -e "  ${RED} Archivo no encontrado: $seed_file${NC}"
        ((seed_errors++))
    fi
    
    echo ""
done

# Resumen
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN} Resumen de ejecución de seeds:${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "${WHITE}Total de seeds:        $total_seeds${NC}"
echo -e "${GREEN}Exitosos:              $seed_success${NC}"
echo -e "${YELLOW}Con advertencias:      $seed_errors${NC}"
echo ""

if [ $seed_success -eq $total_seeds ]; then
    echo -e "${GREEN} Todos los seeds se ejecutaron correctamente!${NC}"
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
elif [ $seed_success -gt 0 ]; then
    echo -e "${YELLOW} Seeds ejecutados parcialmente${NC}"
    echo -e "${YELLOW}   Algunos datos pueden ya existir en la base de datos${NC}"
    echo ""
else
    echo -e "${RED} No se pudo ejecutar ningún seed${NC}"
    echo -e "${YELLOW}   Verifica que la base de datos esté correctamente configurada${NC}"
    echo ""
fi
