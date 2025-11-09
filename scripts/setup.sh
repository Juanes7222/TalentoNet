#!/bin/bash
# Script de inicialización para Linux/macOS - Versión Modular

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Importar módulos
source "$SCRIPT_DIR/modules/output-utils.sh"
source "$SCRIPT_DIR/modules/docker-utils.sh"
source "$SCRIPT_DIR/modules/db-utils.sh"
source "$SCRIPT_DIR/modules/node-utils.sh"
source "$SCRIPT_DIR/modules/env-utils.sh"
source "$SCRIPT_DIR/modules/minio-utils.sh"
source "$SCRIPT_DIR/modules/workflow-utils.sh"

write_header "Iniciando setup de TalentoNet" "$COLOR_CYAN"

# Verificar prerequisitos y servicios
if ! invoke_prerequisites_check false; then
    exit 1
fi

# Instalar dependencias
if ! install_dependencies; then
    exit 1
fi

# Configurar variables de entorno
if ! initialize_all_env_files; then
    exit 1
fi

# Iniciar servicios Docker
if ! start_docker_services postgres rabbitmq minio; then
    exit 1
fi

# Esperar a que PostgreSQL esté listo
if ! wait_for_postgres 30; then
    write_error "PostgreSQL no estuvo listo a tiempo"
    exit 1
fi

# Ejecutar setup de base de datos (migraciones + seeds)
if ! invoke_database_setup true; then
    # Verificar si hay tablas en la base de datos
    table_count=$(docker exec talentonet-postgres psql -U talentonet -d talentonet_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    
    if [ ! -z "$table_count" ] && [ "$table_count" -gt 0 ]; then
        write_warning "La base de datos ya está configurada con $table_count tablas"
        write_info "Si necesitas reiniciar la BD, ejecuta: bash ./scripts/reset-db.sh"
    else
        write_warning "Hubo problemas en el setup de la base de datos"
    fi
fi

# Configurar MinIO
if ! initialize_minio_bucket "talentonet-documents" true; then
    write_warning "Hubo un problema al configurar MinIO, pero se puede continuar"
fi

# Resumen final
write_header "Setup completado exitosamente!" "$COLOR_GREEN"

echo -e "${COLOR_YELLOW}Próximos pasos:${COLOR_RESET}"
echo ""
echo "1. Inicia el servidor de desarrollo:"
echo -e "   ${COLOR_GREEN}pnpm dev${COLOR_RESET}"
echo ""
echo "2. Accede a las aplicaciones:"
echo -e "   ${COLOR_GREEN}Frontend:        http://localhost:5173${COLOR_RESET}"
echo -e "   ${COLOR_GREEN}Backend API:     http://localhost:3000${COLOR_RESET}"
echo -e "   ${COLOR_GREEN}API Docs:        http://localhost:3000/api/docs${COLOR_RESET}"
echo -e "   ${COLOR_GREEN}RabbitMQ UI:     http://localhost:15672 (guest/guest)${COLOR_RESET}"
echo -e "   ${COLOR_GREEN}MinIO Console:   http://localhost:9001 (minioadmin/minioadmin)${COLOR_RESET}"
echo ""
echo "3. Usuarios de prueba:"
echo -e "   ${COLOR_GREEN}Admin:   admin@talentonet.com / Password123!${COLOR_RESET}"
echo -e "   ${COLOR_GREEN}RH:      rh@talentonet.com / Password123!${COLOR_RESET}"
echo ""
echo -e "${COLOR_YELLOW}Para detener los servicios:${COLOR_RESET}"
echo -e "   ${COLOR_GREEN}pnpm docker:down${COLOR_RESET}"
echo ""
echo -e "${COLOR_YELLOW}Documentación completa en: README.md${COLOR_RESET}"
echo ""
