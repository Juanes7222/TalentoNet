#!/bin/bash
# Módulo de utilidades para formateo de salida
# Funciones reutilizables para mensajes formateados con colores y emojis

# Colores
if [ -z "$COLOR_RED" ]; then
    readonly COLOR_RED='\033[0;31m'
    readonly COLOR_GREEN='\033[0;32m'
    readonly COLOR_YELLOW='\033[1;33m'
    readonly COLOR_BLUE='\033[0;34m'
    readonly COLOR_MAGENTA='\033[0;35m'
    readonly COLOR_CYAN='\033[0;36m'
    readonly COLOR_WHITE='\033[1;37m'
    readonly COLOR_RESET='\033[0m'
fi

# Write-Header - Escribe un encabezado formateado
write_header() {
    local message="$1"
    local color="${2:-$COLOR_CYAN}"
    
    echo ""
    echo -e "${color}========================================"
    echo -e " $message"
    echo -e "========================================${COLOR_RESET}"
    echo ""
}

# Write-Success - Mensaje de éxito
write_success() {
    echo -e "${COLOR_GREEN}✅ $1${COLOR_RESET}"
}

# Write-Error - Mensaje de error
write_error() {
    echo -e "${COLOR_RED}❌ $1${COLOR_RESET}" >&2
}

# Write-Warning - Mensaje de advertencia
write_warning() {
    echo -e "${COLOR_YELLOW}⚠️  $1${COLOR_RESET}"
}

# Write-Info - Mensaje informativo
write_info() {
    echo -e "${COLOR_BLUE}ℹ️  $1${COLOR_RESET}"
}

# Write-Step - Mensaje de paso en proceso
write_step() {
    echo -e "${COLOR_YELLOW}$1${COLOR_RESET}"
}
