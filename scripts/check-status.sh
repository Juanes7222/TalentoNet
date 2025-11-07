#!/bin/bash
# Script para verificar estado del sistema - Versión Modular

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Importar módulos
source "$SCRIPT_DIR/modules/output-utils.sh"
source "$SCRIPT_DIR/modules/workflow-utils.sh"

write_header "Estado del Sistema TalentoNet" "$COLOR_CYAN"

# Verificar Docker
invoke_docker_check
echo ""

# Verificar PostgreSQL
if test_postgres_connection; then
    write_success "PostgreSQL conectado y funcionando"
else
    write_error "PostgreSQL no está accesible"
fi

echo ""

# Verificar MinIO
write_step "🔍 Verificando MinIO..."
if test_minio_running; then
    write_success "MinIO está corriendo"
else
    write_error "MinIO no está accesible"
fi

echo ""
write_header "Verificación completada" "$COLOR_CYAN"
