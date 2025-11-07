#!/bin/bash
# Script para ejecutar migraciones de base de datos - Versión Modular

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Importar módulos
source "$SCRIPT_DIR/modules/output-utils.sh"
source "$SCRIPT_DIR/modules/db-utils.sh"
source "$SCRIPT_DIR/modules/workflow-utils.sh"

write_header "Ejecutando migraciones de base de datos" "$COLOR_CYAN"

# Verificar PostgreSQL
if ! invoke_postgres_check; then
    write_error "PostgreSQL no está disponible"
    exit 1
fi

# Ejecutar migraciones
if ! invoke_migrations true; then
    write_error "Error al ejecutar migraciones"
    exit 1
fi

write_header "Migraciones completadas exitosamente!" "$COLOR_GREEN"
echo ""
write_info "El esquema de la base de datos ha sido actualizado"
echo ""
