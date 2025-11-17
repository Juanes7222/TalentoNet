-- Migration 015: Update audit_logs table structure
-- Description: Rename columns to match new entity structure
-- Date: 2024-11-17

-- Renombrar columnas para coincidir con la nueva estructura
ALTER TABLE audit_logs 
  RENAME COLUMN user_id TO actor_user_id;

ALTER TABLE audit_logs 
  RENAME COLUMN entity_type TO resource_type;

ALTER TABLE audit_logs 
  RENAME COLUMN entity_id TO resource_id;

-- Eliminar columnas antiguas que ya no se usan
ALTER TABLE audit_logs 
  DROP COLUMN IF EXISTS old_values;

ALTER TABLE audit_logs 
  DROP COLUMN IF EXISTS new_values;

-- Agregar columna details si no existe
ALTER TABLE audit_logs 
  ADD COLUMN IF NOT EXISTS details jsonb;

-- Actualizar el tipo de resource_id de uuid a varchar para mayor flexibilidad
ALTER TABLE audit_logs 
  ALTER COLUMN resource_id TYPE character varying USING resource_id::text;

-- Actualizar índices
DROP INDEX IF EXISTS idx_audit_user;
DROP INDEX IF EXISTS idx_audit_entity;
DROP INDEX IF EXISTS idx_audit_created;

-- Crear nuevos índices
CREATE INDEX IF NOT EXISTS "IDX_audit_logs_actor_action_created" 
  ON "audit_logs" ("actor_user_id", "action", "created_at");

CREATE INDEX IF NOT EXISTS "IDX_audit_logs_resource" 
  ON "audit_logs" ("resource_type", "resource_id");

-- Actualizar foreign key constraint
ALTER TABLE audit_logs 
  DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

ALTER TABLE audit_logs 
  ADD CONSTRAINT "FK_audit_logs_actor" 
  FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL;

-- Actualizar comentario
COMMENT ON TABLE "audit_logs" IS 'Complete audit trail for security and compliance';

SELECT 'Migration 015 completed: audit_logs table structure updated' AS status;
