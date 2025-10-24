-- =====================================================
-- MIGRACIÓN: Actualizar tabla documents para soportar candidatos
-- Versión: 003
-- Fecha: 2025-10-24
-- Descripción: Hacer la tabla documents polimórfica para soportar empleados y candidatos
-- =====================================================

-- 1. Agregar columnas para soporte polimórfico
ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS owner_type VARCHAR(50) DEFAULT 'employee',
    ADD COLUMN IF NOT EXISTS owner_id UUID;

-- 2. Migrar datos existentes
UPDATE documents 
SET owner_type = 'employee', 
    owner_id = employee_id 
WHERE owner_id IS NULL;

-- 3. Hacer owner_id NOT NULL después de migrar datos
ALTER TABLE documents
    ALTER COLUMN owner_id SET NOT NULL;

-- 4. Crear índice compuesto para búsquedas polimórficas
CREATE INDEX IF NOT EXISTS idx_documents_owner 
    ON documents(owner_type, owner_id);

-- 5. Crear índice específico para candidatos
CREATE INDEX IF NOT EXISTS idx_documents_candidate 
    ON documents(owner_id) 
    WHERE owner_type = 'candidate';

-- 6. Agregar constraint de validación
ALTER TABLE documents
    ADD CONSTRAINT check_documents_owner_type 
    CHECK (owner_type IN ('employee', 'candidate'));

-- 7. Comentarios
COMMENT ON COLUMN documents.owner_type IS 'Tipo de entidad dueña: employee o candidate';
COMMENT ON COLUMN documents.owner_id IS 'ID del empleado o candidato dueño del documento';

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
