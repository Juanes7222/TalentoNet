-- =====================================================
-- MIGRACIÓN: Actualización del módulo de Afiliaciones
-- Versión: 006
-- Fecha: 2025-10-24
-- Descripción: Actualiza tabla affiliations existente con nuevas columnas para seguridad social completa
-- =====================================================

-- =====================================================
-- 1. EXTENSIÓN: pgcrypto para cifrado
-- =====================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 2. ACTUALIZAR TABLA affiliations
-- =====================================================

-- Renombrar columnas existentes para nuevo esquema
ALTER TABLE affiliations RENAME COLUMN entity_type TO tipo;
ALTER TABLE affiliations RENAME COLUMN entity_name TO proveedor;
ALTER TABLE affiliations RENAME COLUMN entity_code TO codigo_proveedor;
ALTER TABLE affiliations RENAME COLUMN affiliation_number TO numero_afiliacion_plain;
ALTER TABLE affiliations RENAME COLUMN start_date TO fecha_afiliacion;
ALTER TABLE affiliations RENAME COLUMN end_date TO fecha_retiro;
ALTER TABLE affiliations RENAME COLUMN is_active TO _deprecated_is_active;

-- Agregar nuevas columnas
ALTER TABLE affiliations ADD COLUMN IF NOT EXISTS numero_afiliacion_encrypted BYTEA;
ALTER TABLE affiliations ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'retirado'));
ALTER TABLE affiliations ADD COLUMN IF NOT EXISTS comprobante_s3_key TEXT;
ALTER TABLE affiliations ADD COLUMN IF NOT EXISTS comprobante_url TEXT;
ALTER TABLE affiliations ADD COLUMN IF NOT EXISTS comprobante_filename VARCHAR(500);
ALTER TABLE affiliations ADD COLUMN IF NOT EXISTS consentimiento_arco BOOLEAN DEFAULT false;
ALTER TABLE affiliations ADD COLUMN IF NOT EXISTS fecha_consentimiento TIMESTAMP WITH TIME ZONE;
ALTER TABLE affiliations ADD COLUMN IF NOT EXISTS external_id VARCHAR(100);
ALTER TABLE affiliations ADD COLUMN IF NOT EXISTS integration_status VARCHAR(50);
ALTER TABLE affiliations ADD COLUMN IF NOT EXISTS integration_response JSONB;
ALTER TABLE affiliations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE affiliations ADD COLUMN IF NOT EXISTS retired_by UUID REFERENCES users(id);
ALTER TABLE affiliations ADD COLUMN IF NOT EXISTS retired_at TIMESTAMP WITH TIME ZONE;

-- Actualizar constraint de tipo
DO $$
BEGIN
    ALTER TABLE affiliations DROP CONSTRAINT IF EXISTS affiliations_tipo_check;
    ALTER TABLE affiliations ADD CONSTRAINT affiliations_tipo_check 
        CHECK (tipo IN ('ARL', 'EPS', 'AFP', 'CAJA'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Migrar datos: copiar is_active a estado
UPDATE affiliations SET estado = 
    CASE 
        WHEN _deprecated_is_active = true THEN 'activo'
        ELSE 'retirado'
    END
WHERE estado IS NULL;

-- Migrar datos: cifrar números de afiliación existentes
DO $$
DECLARE
    encryption_key TEXT := 'TalentoNetSecretKey2025'; -- En producción viene de ENV
    rec RECORD;
BEGIN
    FOR rec IN SELECT id, numero_afiliacion_plain FROM affiliations WHERE numero_afiliacion_encrypted IS NULL AND numero_afiliacion_plain IS NOT NULL
    LOOP
        UPDATE affiliations 
        SET numero_afiliacion_encrypted = encrypt_affiliation_number(rec.numero_afiliacion_plain, encryption_key)
        WHERE id = rec.id;
    END LOOP;
END $$;

-- Agregar índices adicionales
CREATE INDEX IF NOT EXISTS idx_affiliations_tipo ON affiliations(tipo);
CREATE INDEX IF NOT EXISTS idx_affiliations_estado ON affiliations(estado);
CREATE INDEX IF NOT EXISTS idx_affiliations_proveedor ON affiliations(proveedor);
CREATE INDEX IF NOT EXISTS idx_affiliations_fecha_afiliacion ON affiliations(fecha_afiliacion DESC);
CREATE INDEX IF NOT EXISTS idx_affiliations_created_by ON affiliations(created_by);

-- Constraint: Solo una afiliación activa del mismo tipo por empleado
DROP INDEX IF EXISTS idx_affiliations_unique_active;
CREATE UNIQUE INDEX idx_affiliations_unique_active 
    ON affiliations(employee_id, tipo) 
    WHERE estado = 'activo';

-- =====================================================
-- 3. ACTUALIZAR TABLA affiliation_logs
-- =====================================================

-- Verificar si la tabla existe y actualizarla
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'affiliation_logs') THEN
        -- Agregar columnas faltantes si no existen
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliation_logs' AND column_name = 'metadata') THEN
            ALTER TABLE affiliation_logs ADD COLUMN metadata JSONB;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliation_logs' AND column_name = 'ip_address') THEN
            ALTER TABLE affiliation_logs ADD COLUMN ip_address VARCHAR(45);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'affiliation_logs' AND column_name = 'user_agent') THEN
            ALTER TABLE affiliation_logs ADD COLUMN user_agent TEXT;
        END IF;
        
        -- Actualizar constraint de accion
        ALTER TABLE affiliation_logs DROP CONSTRAINT IF EXISTS affiliation_logs_accion_check;
        ALTER TABLE affiliation_logs ADD CONSTRAINT affiliation_logs_accion_check 
            CHECK (accion IN (
                'creacion',
                'actualizacion',
                'retiro',
                'integracion_exitosa',
                'integracion_fallida',
                'documento_actualizado',
                'reactivacion'
            ));
    END IF;
END $$;

-- =====================================================
-- 4. CREAR TABLA affiliation_providers
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliation_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información del proveedor
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ARL', 'EPS', 'AFP', 'CAJA')),
    nombre VARCHAR(200) NOT NULL,
    nit VARCHAR(20),
    codigo VARCHAR(50),
    
    -- Contacto
    email VARCHAR(255),
    telefono VARCHAR(50),
    website VARCHAR(500),
    
    -- Configuración de integración API
    api_enabled BOOLEAN DEFAULT false,
    api_endpoint TEXT,
    api_auth_type VARCHAR(50),
    api_credentials_encrypted BYTEA,
    
    -- Plantilla de correo para radicado manual
    email_template TEXT,
    email_destino VARCHAR(255),
    
    -- Validación de número de afiliación
    numero_afiliacion_pattern VARCHAR(200),
    numero_afiliacion_ejemplo VARCHAR(100),
    
    -- Estado
    activo BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para affiliation_providers
CREATE INDEX IF NOT EXISTS idx_affiliation_providers_tipo ON affiliation_providers(tipo);
CREATE INDEX IF NOT EXISTS idx_affiliation_providers_activo ON affiliation_providers(activo);
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliation_providers_nombre ON affiliation_providers(nombre) WHERE activo = true;

-- Trigger para affiliation_providers
DROP TRIGGER IF EXISTS update_affiliation_providers_updated_at ON affiliation_providers;
CREATE TRIGGER update_affiliation_providers_updated_at
    BEFORE UPDATE ON affiliation_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ACTUALIZAR TRIGGERS
-- =====================================================

-- Recrear trigger de creación
DROP TRIGGER IF EXISTS affiliation_creation_logger ON affiliations;
DROP FUNCTION IF EXISTS log_affiliation_creation() CASCADE;

CREATE OR REPLACE FUNCTION log_affiliation_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO affiliation_logs (
        affiliation_id,
        accion,
        detalle,
        usuario_id,
        metadata
    ) VALUES (
        NEW.id,
        'creacion',
        'Afiliación creada: ' || NEW.tipo || ' - ' || NEW.proveedor,
        NEW.created_by,
        jsonb_build_object(
            'tipo', NEW.tipo,
            'proveedor', NEW.proveedor,
            'fecha_afiliacion', NEW.fecha_afiliacion,
            'consentimiento_arco', COALESCE(NEW.consentimiento_arco, false)
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER affiliation_creation_logger
    AFTER INSERT ON affiliations
    FOR EACH ROW
    EXECUTE FUNCTION log_affiliation_creation();

-- Recrear trigger de retiro
DROP TRIGGER IF EXISTS affiliation_retirement_logger ON affiliations;
DROP FUNCTION IF EXISTS log_affiliation_retirement() CASCADE;

CREATE OR REPLACE FUNCTION log_affiliation_retirement()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado != NEW.estado AND NEW.estado = 'retirado' THEN
        INSERT INTO affiliation_logs (
            affiliation_id,
            accion,
            detalle,
            usuario_id,
            metadata
        ) VALUES (
            NEW.id,
            'retiro',
            'Afiliación retirada: ' || NEW.tipo || ' - ' || NEW.proveedor,
            NEW.retired_by,
            jsonb_build_object(
                'fecha_retiro', NEW.fecha_retiro,
                'estado_anterior', OLD.estado,
                'estado_nuevo', NEW.estado
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER affiliation_retirement_logger
    AFTER UPDATE ON affiliations
    FOR EACH ROW
    EXECUTE FUNCTION log_affiliation_retirement();

-- =====================================================
-- 6. VISTA ACTUALIZADA
-- =====================================================
DROP VIEW IF EXISTS v_active_affiliations;
CREATE OR REPLACE VIEW v_active_affiliations AS
SELECT 
    a.id,
    a.employee_id,
    e.nombre || ' ' || e.apellido AS empleado_nombre,
    e.cedula AS empleado_cedula,
    a.tipo,
    a.proveedor,
    a.fecha_afiliacion,
    a.estado,
    a.comprobante_filename,
    a.integration_status,
    a.created_at,
    COALESCE(u.nombre || ' ' || u.apellido, 'Sistema') AS creado_por
FROM affiliations a
INNER JOIN employees e ON a.employee_id = e.id
LEFT JOIN users u ON a.created_by = u.id
WHERE a.estado = 'activo';

-- =====================================================
-- 7. COMENTARIOS
-- =====================================================
COMMENT ON TABLE affiliations IS 'Afiliaciones a seguridad social (ARL, EPS, AFP, Caja) por empleado - Actualizado para módulo completo';
COMMENT ON COLUMN affiliations.numero_afiliacion_encrypted IS 'Número de afiliación cifrado con pgcrypto';
COMMENT ON COLUMN affiliations.consentimiento_arco IS 'Consentimiento ARCO del empleado';

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
