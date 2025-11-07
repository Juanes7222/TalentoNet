#!/bin/bash
# Script para cargar datos de prueba (seeds) - Versión Modular

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Importar módulos
source "$SCRIPT_DIR/modules/output-utils.sh"
source "$SCRIPT_DIR/modules/db-utils.sh"
source "$SCRIPT_DIR/modules/workflow-utils.sh"

write_header "Cargando datos de prueba" "$COLOR_CYAN"

# Verificar PostgreSQL
if ! invoke_postgres_check; then
    write_error "PostgreSQL no está disponible"
    exit 1
fi

# Cargar seeds
if ! invoke_seeds true; then
    write_error "Error al cargar seeds"
    exit 1
fi

write_header "Seeds cargados exitosamente!" "$COLOR_GREEN"
echo ""
write_info "Los datos de prueba han sido cargados en la base de datos"
echo ""
