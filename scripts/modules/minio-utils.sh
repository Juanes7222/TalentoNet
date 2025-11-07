#!/bin/bash
# Módulo de utilidades para MinIO
# Funciones reutilizables para configurar MinIO

# Importar módulo de output
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/output-utils.sh"

# Configuración MinIO
readonly MINIO_HOST="${MINIO_HOST:-localhost:9000}"
readonly MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-minioadmin}"
readonly MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-minioadmin}"

# test_minio_running - Verifica si MinIO está corriendo
test_minio_running() {
    curl -s "http://$MINIO_HOST/minio/health/live" &> /dev/null
    return $?
}

# initialize_minio_bucket - Inicializa un bucket en MinIO
initialize_minio_bucket() {
    local bucket_name="$1"
    local public_read="${2:-true}"
    
    write_step "🪣 Configurando bucket de MinIO..."
    
    if ! test_minio_running; then
        write_error "MinIO no está corriendo"
        return 1
    fi
    
    # Configurar mc (MinIO Client)
    if ! command -v mc &> /dev/null; then
        write_warning "MinIO Client (mc) no está instalado"
        write_info "Instálalo desde: https://min.io/docs/minio/linux/reference/minio-mc.html"
        return 1
    fi
    
    # Configurar alias
    mc alias set myminio "http://$MINIO_HOST" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" &> /dev/null
    
    # Crear bucket si no existe
    if ! mc ls myminio/$bucket_name &> /dev/null; then
        mc mb myminio/$bucket_name &> /dev/null
        if [ $? -eq 0 ]; then
            write_success "Bucket '$bucket_name' creado"
        else
            write_error "Error al crear bucket"
            return 1
        fi
    else
        write_info "Bucket '$bucket_name' ya existe"
    fi
    
    # Configurar política de acceso público si se requiere
    if [ "$public_read" = true ]; then
        mc anonymous set download myminio/$bucket_name &> /dev/null
        if [ $? -eq 0 ]; then
            write_success "Política de lectura pública configurada"
        else
            write_warning "No se pudo configurar política pública"
        fi
    fi
    
    write_success "Configuración de MinIO completada"
    return 0
}
