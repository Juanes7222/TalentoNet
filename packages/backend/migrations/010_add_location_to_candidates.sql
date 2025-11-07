-- Migración 010: Agregar campos de ubicación a candidatos
-- Descripción: Agrega ciudad, departamento y dirección a la tabla de candidatos

-- Agregar columnas de ubicación
ALTER TABLE candidates
ADD COLUMN ciudad VARCHAR(100),
ADD COLUMN departamento VARCHAR(100),
ADD COLUMN direccion TEXT;

-- Crear índices para búsquedas por ubicación
CREATE INDEX idx_candidates_ciudad ON candidates(ciudad);
CREATE INDEX idx_candidates_departamento ON candidates(departamento);

-- Comentarios
COMMENT ON COLUMN candidates.ciudad IS 'Ciudad de residencia del candidato';
COMMENT ON COLUMN candidates.departamento IS 'Departamento de residencia del candidato';
COMMENT ON COLUMN candidates.direccion IS 'Dirección de residencia del candidato';
