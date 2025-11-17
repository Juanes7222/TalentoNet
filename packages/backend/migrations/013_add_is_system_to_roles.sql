-- Migration: Add is_system column to roles table
-- Description: Adds boolean flag to mark system roles as protected

-- Add is_system column
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;

-- Mark existing system roles
UPDATE roles SET is_system = true WHERE name IN ('admin', 'rrhh', 'contabilidad', 'gerencia', 'employee');

-- Add comment
COMMENT ON COLUMN roles.is_system IS 'Indicates if this is a system role that cannot be deleted';
