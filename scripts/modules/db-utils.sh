#!/bin/bash
# Módulo de utilidades para base de datos PostgreSQL
# Funciones reutilizables para migraciones, seeds y gestión de BD

# Importar módulo de output (asumiendo que está en el mismo directorio modules/)
MODULE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$MODULE_DIR/output-utils.sh"

# Configuración de conexión PostgreSQL
if [ -z "$DB_HOST" ]; then
    readonly DB_HOST="${DB_HOST:-localhost}"
    readonly DB_PORT="${DB_PORT:-5432}"
    readonly DB_NAME="${DB_NAME:-talentonet_db}"
    readonly DB_USER="${DB_USER:-talentonet}"
    readonly DB_PASSWORD="${DB_PASSWORD:-talentonet_secret}"
fi

# test_postgres_connection - Verifica la conexión a PostgreSQL
test_postgres_connection() {
    # Intentar primero con psql si está disponible
    if command -v psql &> /dev/null; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' &> /dev/null
        return $?
    fi
    
    # Si psql no está disponible, usar docker exec (útil en Windows/Git Bash)
    if command -v docker &> /dev/null; then
        docker exec talentonet-postgres pg_isready -U "$DB_USER" -d "$DB_NAME" &> /dev/null
        return $?
    fi
    
    # Si ninguno está disponible, asumir que no está conectado
    return 1
}

# wait_for_postgres - Espera a que PostgreSQL esté listo
wait_for_postgres() {
    local timeout="${1:-30}"
    local elapsed=0
    
    write_step "⏳ Esperando a que PostgreSQL esté listo..."
    
    while [ $elapsed -lt $timeout ]; do
        if test_postgres_connection; then
            write_success "PostgreSQL está listo"
            return 0
        fi
        sleep 1
        ((elapsed++))
    done
    
    write_error "Timeout esperando a PostgreSQL"
    return 1
}

# drop_database - Elimina la base de datos
drop_database() {
    write_step "🗑️  Eliminando base de datos..."
    
    if command -v psql &> /dev/null; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" \
            -c "DROP DATABASE IF EXISTS $DB_NAME;" &> /dev/null
    else
        # Usar docker exec como alternativa
        docker exec talentonet-postgres psql -U "$DB_USER" -d "postgres" \
            -c "DROP DATABASE IF EXISTS $DB_NAME;" &> /dev/null
    fi
    
    if [ $? -eq 0 ]; then
        write_success "Base de datos eliminada"
        return 0
    else
        write_error "Error al eliminar base de datos"
        return 1
    fi
}

# create_database - Crea la base de datos
create_database() {
    write_step "📊 Creando base de datos..."
    
    if command -v psql &> /dev/null; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" \
            -c "CREATE DATABASE $DB_NAME;" &> /dev/null
    else
        # Usar docker exec como alternativa
        docker exec talentonet-postgres psql -U "$DB_USER" -d "postgres" \
            -c "CREATE DATABASE $DB_NAME;" &> /dev/null
    fi
    
    if [ $? -eq 0 ]; then
        write_success "Base de datos creada"
        return 0
    else
        write_error "Error al crear base de datos"
        return 1
    fi
}

# invoke_sql_file - Ejecuta un archivo SQL
invoke_sql_file() {
    local sql_file="$1"
    local file_name=$(basename "$sql_file")
    local verbose="${2:-false}"
    
    if [ ! -f "$sql_file" ]; then
        write_error "Archivo no encontrado: $sql_file"
        return 1
    fi
    
    echo "  📄 Ejecutando: $file_name"
    
    local result
    local error_output
    
    if command -v psql &> /dev/null; then
        error_output=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
            -f "$sql_file" 2>&1)
        result=$?
    else
        # Usar docker exec: copiar archivo al contenedor, ejecutar, limpiar
        docker cp "$sql_file" talentonet-postgres:/tmp/temp.sql &> /dev/null
        error_output=$(docker exec talentonet-postgres psql -U "$DB_USER" -d "$DB_NAME" \
            -f /tmp/temp.sql 2>&1)
        result=$?
        docker exec talentonet-postgres rm /tmp/temp.sql &> /dev/null
    fi
    
    if [ $result -eq 0 ]; then
        write_success "$file_name ejecutado"
        return 0
    else
        write_error "Error en $file_name"
        if [ "$verbose" = true ]; then
            echo -e "${COLOR_YELLOW}Primeras líneas del error:${COLOR_RESET}"
            echo "$error_output" | grep -i "error" | head -5
        fi
        return 1
    fi
}

# get_seed_files - Obtiene lista de archivos seed ordenados
get_seed_files() {
    local project_root="$(cd "$MODULE_DIR/../.." && pwd)"
    local seeds_path="$project_root/packages/backend/seeds"
    
    if [ ! -d "$seeds_path" ]; then
        write_error "Directorio de seeds no encontrado: $seeds_path"
        return 1
    fi
    
    # Buscar y ordenar archivos .sql
    find "$seeds_path" -name "*.sql" -type f | sort
}

# invoke_migrations - Ejecuta todas las migraciones
invoke_migrations() {
    local verbose="${1:-false}"
    
    local project_root="$(cd "$MODULE_DIR/../.." && pwd)"
    local migrations_path="$project_root/packages/backend/migrations"
    
    if [ "$verbose" = true ]; then
        write_step "📊 Ejecutando migraciones..."
    fi
    
    if [ ! -d "$migrations_path" ]; then
        write_error "Directorio de migraciones no encontrado"
        return 1
    fi
    
    local success=0
    local failed=0
    
    for migration in "$migrations_path"/*.sql; do
        if [ -f "$migration" ]; then
            if invoke_sql_file "$migration"; then
                ((success++))
            else
                ((failed++))
            fi
        fi
    done
    
    if [ "$verbose" = true ]; then
        echo ""
        echo "  Exitosas: $success"
        if [ $failed -gt 0 ]; then
            echo "  Fallidas:  $failed"
        fi
        echo ""
    fi
    
    if [ $failed -eq 0 ]; then
        write_success "Migraciones completadas"
        return 0
    else
        write_error "Algunas migraciones fallaron"
        return 1
    fi
}

# invoke_seeds - Ejecuta todos los seeds
invoke_seeds() {
    local verbose="${1:-false}"
    
    if [ "$verbose" = true ]; then
        write_step "🌱 Cargando datos de prueba..."
    fi
    
    local success=0
    local failed=0
    
    while IFS= read -r seed; do
        if invoke_sql_file "$seed"; then
            ((success++))
        else
            ((failed++))
        fi
    done < <(get_seed_files)
    
    if [ "$verbose" = true ]; then
        echo ""
        echo "  Exitosos: $success"
        if [ $failed -gt 0 ]; then
            echo "  Fallidos:  $failed"
        fi
        echo ""
    fi
    
    if [ $failed -eq 0 ]; then
        write_success "Seeds cargados"
        return 0
    else
        write_error "Algunos seeds fallaron"
        return 1
    fi
}
