#!/bin/bash
# Módulo de utilidades de workflow de alto nivel
# Funciones que combinan múltiples operaciones para flujos comunes

# Importar todos los módulos necesarios
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output-utils.sh"
source "$SCRIPT_DIR/docker-utils.sh"
source "$SCRIPT_DIR/node-utils.sh"
source "$SCRIPT_DIR/db-utils.sh"
source "$SCRIPT_DIR/minio-utils.sh"

# invoke_prerequisites_check - Verifica todos los prerequisitos
invoke_prerequisites_check() {
    local start_services="${1:-false}"
    
    write_step "🔍 Verificando prerequisitos..."
    echo ""
    
    local all_ok=true
    
    # Verificar Node.js
    if ! test_node_installed; then
        all_ok=false
    fi
    
    # Verificar pnpm
    if ! test_pnpm_installed; then
        all_ok=false
    fi
    
    # Verificar Docker
    if ! test_docker_installed; then
        all_ok=false
    fi
    
    echo ""
    
    if [ "$all_ok" = false ]; then
        write_error "Algunos prerequisitos faltan"
        return 1
    fi
    
    write_success "Todos los prerequisitos están instalados"
    
    # Verificar Docker corriendo
    if ! test_docker_running; then
        write_error "Docker no está corriendo"
        return 1
    fi
    write_success "Docker está corriendo"
    
    # Verificar contenedores
    local containers=("talentonet-postgres" "talentonet-rabbitmq" "talentonet-minio")
    for container in "${containers[@]}"; do
        if test_container_running "$container"; then
            echo "  ✅ $container"
        else
            echo "  ❌ $container no está corriendo"
            if [ "$start_services" = true ]; then
                all_ok=false
            fi
        fi
    done
    
    # Iniciar servicios si se solicita y no están corriendo
    if [ "$start_services" = true ] && [ "$all_ok" = false ]; then
        write_info "Ejecuta: pnpm docker:up"
    fi
    
    # Verificar PostgreSQL
    if test_postgres_connection; then
        write_success "PostgreSQL está listo"
    else
        write_error "PostgreSQL no está corriendo"
        write_info "Ejecuta: pnpm docker:up"
        return 1
    fi
    
    echo ""
    write_success "Todos los prerequisitos están listos"
    return 0
}

# invoke_postgres_check - Verifica solo PostgreSQL
invoke_postgres_check() {
    write_step "🔍 Verificando PostgreSQL..."
    
    if ! test_container_running "talentonet-postgres"; then
        write_error "Contenedor PostgreSQL no está corriendo"
        return 1
    fi
    
    if ! wait_for_postgres 30; then
        return 1
    fi
    
    return 0
}

# invoke_docker_check - Verifica estado de Docker
invoke_docker_check() {
    write_step "🔍 Verificando Docker..."
    
    if ! test_docker_installed; then
        return 1
    fi
    
    if ! test_docker_running; then
        write_error "Docker no está corriendo"
        return 1
    fi
    
    write_success "Docker está corriendo"
    
    local containers=("talentonet-postgres" "talentonet-rabbitmq" "talentonet-minio")
    for container in "${containers[@]}"; do
        if test_container_running "$container"; then
            echo "  ✅ $container"
        else
            echo "  ❌ $container"
        fi
    done
    
    return 0
}

# invoke_database_setup - Ejecuta migraciones y seeds
invoke_database_setup() {
    local verbose="${1:-true}"
    
    if [ "$verbose" = true ]; then
        write_step "🔄 Configurando base de datos..."
        echo ""
    fi
    
    local migrations_ok=true
    local seeds_ok=true
    
    # Ejecutar migraciones
    if ! invoke_migrations "$verbose"; then
        migrations_ok=false
    fi
    
    # Ejecutar seeds
    if ! invoke_seeds "$verbose"; then
        seeds_ok=false
    fi
    
    if [ "$verbose" = true ]; then
        if [ "$migrations_ok" = true ] && [ "$seeds_ok" = true ]; then
            write_success "Setup de base de datos completado"
        else
            write_warning "Setup de base de datos completado con errores"
        fi
    fi
    
    [ "$migrations_ok" = true ] && [ "$seeds_ok" = true ]
    return $?
}

# invoke_full_database_reset - Reset completo de base de datos
invoke_full_database_reset() {
    write_header "Reset completo de base de datos" "$COLOR_YELLOW"
    
    # Verificar que PostgreSQL esté corriendo
    if ! invoke_postgres_check; then
        write_error "PostgreSQL no está disponible"
        return 1
    fi
    
    # Eliminar base de datos
    if ! drop_database; then
        return 1
    fi
    
    # Crear base de datos
    if ! create_database; then
        return 1
    fi
    
    # Ejecutar migraciones y seeds
    if ! invoke_database_setup true; then
        return 1
    fi
    
    write_header "Reset completado exitosamente!" "$COLOR_GREEN"
    return 0
}
