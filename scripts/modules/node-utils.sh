#!/bin/bash
# Módulo de utilidades para Node.js
# Funciones reutilizables para verificar Node y pnpm

# Importar módulo de output
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output-utils.sh"

# test_node_installed - Verifica si Node.js está instalado
test_node_installed() {
    if ! command -v node &> /dev/null; then
        write_error "Node.js no está instalado"
        write_info "Descárgalo desde: https://nodejs.org"
        return 1
    fi
    
    local node_version=$(node --version)
    write_success "Node.js $node_version instalado"
    return 0
}

# test_pnpm_installed - Verifica si pnpm está instalado
test_pnpm_installed() {
    if ! command -v pnpm &> /dev/null; then
        write_error "pnpm no está instalado"
        write_info "Instálalo con: npm install -g pnpm"
        return 1
    fi
    
    local pnpm_version=$(pnpm --version)
    write_success "pnpm $pnpm_version instalado"
    return 0
}

# install_dependencies - Instala dependencias del proyecto
install_dependencies() {
    write_step "📦 Instalando dependencias..."
    
    local project_root="$(cd "$SCRIPT_DIR/../.." && pwd)"
    cd "$project_root" || return 1
    
    if [ -f "pnpm-lock.yaml" ]; then
        echo "  Usando pnpm install (lockfile existente)"
        pnpm install
    else
        echo "  Usando pnpm install (generando lockfile)"
        pnpm install
    fi
    
    if [ $? -eq 0 ]; then
        write_success "Dependencias instaladas"
        return 0
    else
        write_error "Error al instalar dependencias"
        return 1
    fi
}
