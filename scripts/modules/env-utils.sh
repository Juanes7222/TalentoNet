#!/bin/bash
# Módulo de utilidades para variables de entorno
# Funciones reutilizables para gestionar archivos .env

# Importar módulo de output (asumiendo que está en el mismo directorio modules/)
MODULE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$MODULE_DIR/output-utils.sh"

# initialize_env_file - Inicializa un archivo .env desde .env.example
initialize_env_file() {
    local package_path="$1"
    local package_name="$2"
    
    local project_root="$(cd "$MODULE_DIR/../.." && pwd)"
    local example_path="$project_root/$package_path/.env.example"
    local env_path="$project_root/$package_path/.env"
    
    if [ ! -f "$example_path" ]; then
        write_error "Archivo .env.example no encontrado en $package_path/.env.example"
        return 1
    fi
    
    if [ -f "$env_path" ]; then
        write_info "Archivo .env ya existe en $package_name"
        return 0
    fi
    
    cp "$example_path" "$env_path"
    if [ $? -eq 0 ]; then
        write_success "Archivo .env creado para $package_name"
        return 0
    else
        write_error "Error al crear .env para $package_name"
        return 1
    fi
}

# initialize_all_env_files - Inicializa todos los archivos .env del proyecto
initialize_all_env_files() {
    write_step "📝 Configurando variables de entorno..."
    echo ""
    
    local success=0
    
    # Backend
    if initialize_env_file "packages/backend" "backend"; then
        ((success++))
    fi
    
    # Frontend
    if [ -f "$(cd "$MODULE_DIR/../.." && pwd)/packages/frontend/.env.example" ]; then
        if initialize_env_file "packages/frontend" "frontend"; then
            ((success++))
        fi
    else
        write_info "No se encontró .env.example en frontend"
        ((success++))
    fi
    
    echo ""
    if [ $success -eq 2 ]; then
        write_success "Variables de entorno configuradas"
        return 0
    else
        return 1
    fi
}
