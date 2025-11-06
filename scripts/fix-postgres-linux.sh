#!/bin/bash

# Script para solucionar problemas de autenticación PostgreSQL en Linux
# Este script limpia completamente PostgreSQL y lo reinicia con credenciales frescas

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}  Solucionando problemas de autenticación PostgreSQL...${NC}"
echo ""

# Paso 1: Detener y eliminar TODO
echo -e "${YELLOW}Paso 1: Deteniendo contenedores y eliminando volúmenes...${NC}"
docker compose -f infra/docker-compose.yml down -v 2>/dev/null || true
docker compose -f infra/docker-compose.yml rm -f 2>/dev/null || true

# Paso 2: Eliminar contenedor específico de PostgreSQL si existe
echo -e "${YELLOW}Paso 2: Eliminando contenedor PostgreSQL antiguo...${NC}"
docker rm -f talentonet-postgres 2>/dev/null || true

# Paso 3: Eliminar volúmenes manualmente
echo -e "${YELLOW}Paso 3: Limpiando volúmenes de PostgreSQL...${NC}"
docker volume rm infra_postgres_data 2>/dev/null || true
docker volume rm talentonet_postgres_data 2>/dev/null || true
docker volume rm postgres_data 2>/dev/null || true

# Paso 4: Verificar credenciales en .env
echo -e "${YELLOW}Paso 4: Verificando credenciales en .env...${NC}"
if [ ! -f "packages/backend/.env" ]; then
    echo -e "${RED}  Archivo .env no encontrado${NC}"
    echo -e "${YELLOW}Copiando desde .env.example...${NC}"
    cp packages/backend/.env.example packages/backend/.env
fi

DB_PASSWORD=$(grep "^DB_PASSWORD=" packages/backend/.env | cut -d '=' -f2)
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}  DB_PASSWORD no está configurado en .env${NC}"
    exit 1
fi

echo -e "${GREEN}  Contraseña configurada: ${DB_PASSWORD}${NC}"

# Paso 5: Verificar credenciales en docker-compose.yml
echo -e "${YELLOW}Paso 5: Verificando docker-compose.yml...${NC}"
COMPOSE_PASSWORD=$(grep "POSTGRES_PASSWORD:" infra/docker-compose.yml | head -1 | awk '{print $2}')
echo -e "${GREEN}  Contraseña en compose: ${COMPOSE_PASSWORD}${NC}"

if [ "$DB_PASSWORD" != "$COMPOSE_PASSWORD" ]; then
    echo -e "${RED}  Las contraseñas NO coinciden!${NC}"
    echo -e "${YELLOW}   .env tiene: ${DB_PASSWORD}${NC}"
    echo -e "${YELLOW}   docker-compose.yml tiene: ${COMPOSE_PASSWORD}${NC}"
    echo -e "${YELLOW}Por favor, corrige manualmente para que sean iguales.${NC}"
    exit 1
fi

# Paso 6: Limpiar cualquier proceso de PostgreSQL local
echo -e "${YELLOW}Paso 6: Verificando PostgreSQL local...${NC}"
if systemctl is-active --quiet postgresql 2>/dev/null; then
    echo -e "${YELLOW}  PostgreSQL local está corriendo. Esto puede causar conflictos.${NC}"
    echo -e "${YELLOW}   Para detenerlo: sudo systemctl stop postgresql${NC}"
    read -p "¿Deseas detenerlo ahora? (s/N): " STOP_PG
    if [ "$STOP_PG" = "s" ] || [ "$STOP_PG" = "S" ]; then
        sudo systemctl stop postgresql
        echo -e "${GREEN}  PostgreSQL local detenido${NC}"
    fi
fi

# Paso 7: Iniciar PostgreSQL fresco
echo -e "${YELLOW}Paso 7: Iniciando PostgreSQL con configuración limpia...${NC}"
docker compose -f infra/docker-compose.yml up -d postgres

echo -e "${YELLOW}Esperando 15 segundos para que PostgreSQL inicie completamente...${NC}"
sleep 15

# Paso 8: Verificar que PostgreSQL está corriendo
echo -e "${YELLOW}Paso 8: Verificando estado de PostgreSQL...${NC}"
if ! docker ps | grep -q talentonet-postgres; then
    echo -e "${RED}  El contenedor PostgreSQL no está corriendo${NC}"
    echo -e "${YELLOW}Ver logs:${NC}"
    docker logs talentonet-postgres
    exit 1
fi

echo -e "${GREEN}  Contenedor PostgreSQL está corriendo${NC}"

# Paso 9: Verificar conexión
echo -e "${YELLOW}Paso 9: Probando conexión a la base de datos...${NC}"
export PGPASSWORD="${DB_PASSWORD}"

if docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}  Conexión exitosa!${NC}"
else
    echo -e "${RED}  No se pudo conectar a PostgreSQL${NC}"
    echo -e "${YELLOW}Intentando mostrar logs...${NC}"
    docker logs --tail 50 talentonet-postgres
    exit 1
fi

# Paso 10: Verificar usuario y permisos
echo -e "${YELLOW}Paso 10: Verificando usuario y permisos...${NC}"
USERS=$(docker exec -i talentonet-postgres psql -U talentonet -d talentonet_db -t -c "SELECT usename FROM pg_user WHERE usename='talentonet';")

if echo "$USERS" | grep -q "talentonet"; then
    echo -e "${GREEN}  Usuario 'talentonet' existe${NC}"
else
    echo -e "${RED}  Usuario 'talentonet' NO existe${NC}"
    exit 1
fi

# Paso 11: Mostrar información de conexión
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  PostgreSQL configurado correctamente!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Información de conexión:${NC}"
echo -e "  Host:     localhost"
echo -e "  Puerto:   5432"
echo -e "  Usuario:  talentonet"
echo -e "  Password: ${DB_PASSWORD}"
echo -e "  Base de datos: talentonet_db"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo -e "  1. Ejecutar migraciones: ${GREEN}bash ./scripts/setup.sh${NC}"
echo -e "  2. O iniciar el backend: ${GREEN}cd packages/backend && pnpm dev${NC}"
echo ""
