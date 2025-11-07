#!/bin/bash
# Script para resetear la base de datos - Versión Modular

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Importar módulos
source "$SCRIPT_DIR/modules/output-utils.sh"
source "$SCRIPT_DIR/modules/workflow-utils.sh"

# Ejecutar reset completo
invoke_full_database_reset
exit $?
