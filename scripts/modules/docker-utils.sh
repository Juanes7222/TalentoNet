#!/bin/bash
# Módulo de utilidades para Docker
# Funciones reutilizables para verificar y gestionar Docker

# Importar módulo de output (asumiendo que está en el mismo directorio modules/)
MODULE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$MODULE_DIR/output-utils.sh"

# test_docker_installed - Verifica si Docker está instalado
test_docker_installed() {
    if ! command -v docker &> /dev/null; then
        write_error "Docker no está instalado"
        return 1
    fi
    return 0
}

# test_docker_running - Verifica si Docker está corriendo
test_docker_running() {
    if ! docker ps &> /dev/null; then
        return 1
    fi
    return 0
}

# wait_for_docker_ready - Espera a que Docker esté listo
wait_for_docker_ready() {
    if ! test_docker_running; then
        write_error "Docker no está corriendo."
        write_warning "Por favor:"
        write_warning "1. Inicia Docker"
        write_warning "2. Espera a que esté listo"
        write_warning "3. Presiona Enter para continuar..."
        read -r
        
        if ! test_docker_running; then
            write_error "Docker aún no está listo. Abortando."
            return 1
        fi
    fi
    return 0
}

# test_container_running - Verifica si un contenedor está corriendo
test_container_running() {
    local container_name="$1"
    
    if [ -z "$container_name" ]; then
        write_error "Se requiere el nombre del contenedor"
        return 1
    fi
    
    local container=$(docker ps --filter "name=$container_name" --filter "status=running" --format "{{.Names}}")
    if [ -z "$container" ]; then
        return 1
    fi
    return 0
}

# start_docker_services - Inicia servicios Docker con docker-compose
start_docker_services() {
    local services=("$@")
    
    # Obtener ruta raíz del proyecto (modules/ está en scripts/modules/)
    local project_root="$(cd "$MODULE_DIR/../.." && pwd)"
    local compose_file="$project_root/infra/docker-compose.yml"
    
    write_step "🐳 Iniciando servicios Docker..."
    
    if [ ${#services[@]} -eq 0 ]; then
        docker-compose -f "$compose_file" up -d
    else
        docker-compose -f "$compose_file" up -d "${services[@]}"
    fi
    
    if [ $? -eq 0 ]; then
        write_success "Servicios Docker iniciados"
        return 0
    else
        write_error "Error al iniciar servicios Docker"
        return 1
    fi
}

# stop_docker_services - Detiene servicios Docker
stop_docker_services() {
    local project_root="$(cd "$SCRIPT_DIR/../.." && pwd)"
    local compose_file="$project_root/infra/docker-compose.yml"
    
    write_step "🛑 Deteniendo servicios Docker..."
    docker-compose -f "$compose_file" down
    
    if [ $? -eq 0 ]; then
        write_success "Servicios Docker detenidos"
        return 0
    else
        write_error "Error al detener servicios Docker"
        return 1
    fi
}
