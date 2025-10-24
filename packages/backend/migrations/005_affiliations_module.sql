-- =====================================================
-- MIGRACIÓN: Módulo de Afiliaciones a Seguridad Social
-- Versión: 005
-- Fecha: 2025-10-24
-- Descripción: Tablas para gestión de afiliaciones (ARL, EPS, AFP, Caja) por empleado
-- =====================================================

-- =====================================================
-- 1. EXTENSIÓN: pgcrypto para cifrado de datos sensibles
-- =====================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 2. TABLA: affiliations (Afiliaciones)
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relación con empleado
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Tipo de afiliación
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ARL', 'EPS', 'AFP', 'CAJA')),
    
    -- Información del proveedor
    proveedor VARCHAR(200) NOT NULL,
    
    -- Número de afiliación (cifrado)
    numero_afiliacion_encrypted BYTEA NOT NULL,
    
    -- Fechas
    fecha_afiliacion DATE NOT NULL,
    fecha_retiro DATE,
    
    -- Estado
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'retirado')),
    
    -- Documentos
    comprobante_s3_key TEXT NOT NULL, -- Obligatorio para auditoría
    comprobante_url TEXT,
    comprobante_filename VARCHAR(500),
    
    -- Consentimiento ARCO (Acceso, Rectificación, Cancelación, Oposición)
    consentimiento_arco BOOLEAN NOT NULL DEFAULT false,
    fecha_consentimiento TIMESTAMP WITH TIME ZONE,
    
    -- Datos de integración con API externa
    external_id VARCHAR(100), -- ID en sistema del proveedor
    integration_status VARCHAR(50), -- 'pending', 'success', 'failed', 'manual'
    integration_response JSONB, -- Respuesta de la API externa
    
    -- Auditoría
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    retired_by UUID REFERENCES users(id),
    retired_at TIMESTAMP WITH TIME ZONE
);

-- Índices para affiliations
CREATE INDEX idx_affiliations_employee ON affiliations(employee_id);
CREATE INDEX idx_affiliations_tipo ON affiliations(tipo);
CREATE INDEX idx_affiliations_estado ON affiliations(estado);
CREATE INDEX idx_affiliations_proveedor ON affiliations(proveedor);
CREATE INDEX idx_affiliations_fecha_afiliacion ON affiliations(fecha_afiliacion DESC);
CREATE INDEX idx_affiliations_created_by ON affiliations(created_by);

-- Constraint: Solo una afiliación activa del mismo tipo por empleado
CREATE UNIQUE INDEX idx_affiliations_unique_active 
    ON affiliations(employee_id, tipo) 
    WHERE estado = 'activo';

-- =====================================================
-- 3. TABLA: affiliation_logs (Historial de cambios)
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relación
    affiliation_id UUID NOT NULL REFERENCES affiliations(id) ON DELETE CASCADE,
    
    -- Acción realizada
    accion VARCHAR(50) NOT NULL CHECK (accion IN (
        'creacion',
        'actualizacion',
        'retiro',
        'integracion_exitosa',
        'integracion_fallida',
        'documento_actualizado',
        'reactivacion'
    )),
    
    -- Detalle de la acción
    detalle TEXT,
    
    -- Metadata adicional (JSON para flexibilidad)
    metadata JSONB,
    
    -- Auditoría
    usuario_id UUID REFERENCES users(id),
    fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- IP y User Agent para trazabilidad
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Índices para affiliation_logs
CREATE INDEX idx_affiliation_logs_affiliation ON affiliation_logs(affiliation_id);
CREATE INDEX idx_affiliation_logs_fecha ON affiliation_logs(fecha DESC);
CREATE INDEX idx_affiliation_logs_usuario ON affiliation_logs(usuario_id);
CREATE INDEX idx_affiliation_logs_accion ON affiliation_logs(accion);

-- =====================================================
-- 4. TABLA: affiliation_providers (Catálogo de proveedores)
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliation_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información del proveedor
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ARL', 'EPS', 'AFP', 'CAJA')),
    nombre VARCHAR(200) NOT NULL,
    nit VARCHAR(20),
    codigo VARCHAR(50), -- Código oficial del proveedor
    
    -- Contacto
    email VARCHAR(255),
    telefono VARCHAR(50),
    website VARCHAR(500),
    
    -- Configuración de integración API
    api_enabled BOOLEAN DEFAULT false,
    api_endpoint TEXT,
    api_auth_type VARCHAR(50), -- 'oauth2', 'api_key', 'basic', null
    api_credentials_encrypted BYTEA, -- Credenciales cifradas
    
    -- Plantilla de correo para radicado manual
    email_template TEXT,
    email_destino VARCHAR(255),
    
    -- Validación de número de afiliación (regex)
    numero_afiliacion_pattern VARCHAR(200),
    numero_afiliacion_ejemplo VARCHAR(100),
    
    -- Estado
    activo BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para affiliation_providers
CREATE INDEX idx_affiliation_providers_tipo ON affiliation_providers(tipo);
CREATE INDEX idx_affiliation_providers_activo ON affiliation_providers(activo);
CREATE UNIQUE INDEX idx_affiliation_providers_nombre ON affiliation_providers(nombre) WHERE activo = true;

-- =====================================================
-- 5. FUNCIONES AUXILIARES
-- =====================================================

-- Función para cifrar número de afiliación
CREATE OR REPLACE FUNCTION encrypt_affiliation_number(numero TEXT, secret_key TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(numero, secret_key);
END;
$$ LANGUAGE plpgsql;

-- Función para descifrar número de afiliación
CREATE OR REPLACE FUNCTION decrypt_affiliation_number(encrypted_data BYTEA, secret_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, secret_key);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Trigger para actualizar updated_at en affiliations
CREATE TRIGGER update_affiliations_updated_at
    BEFORE UPDATE ON affiliations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en affiliation_providers
CREATE TRIGGER update_affiliation_providers_updated_at
    BEFORE UPDATE ON affiliation_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para registrar automáticamente creación de afiliación
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
            'consentimiento_arco', NEW.consentimiento_arco
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER affiliation_creation_logger
    AFTER INSERT ON affiliations
    FOR EACH ROW
    EXECUTE FUNCTION log_affiliation_creation();

-- Trigger para registrar retiro de afiliación
CREATE OR REPLACE FUNCTION log_affiliation_retirement()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estado = 'activo' AND NEW.estado = 'retirado' THEN
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
-- 7. VISTAS ÚTILES
-- =====================================================

-- Vista de afiliaciones activas con información descifrada (para usuarios autorizados)
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
    u.nombre || ' ' || u.apellido AS creado_por
FROM affiliations a
INNER JOIN employees e ON a.employee_id = e.id
INNER JOIN users u ON a.created_by = u.id
WHERE a.estado = 'activo';

-- =====================================================
-- 8. COMENTARIOS EN TABLAS (Documentación)
-- =====================================================
COMMENT ON TABLE affiliations IS 'Afiliaciones a seguridad social (ARL, EPS, AFP, Caja) por empleado';
COMMENT ON TABLE affiliation_logs IS 'Historial de cambios y acciones sobre afiliaciones (auditoría completa)';
COMMENT ON TABLE affiliation_providers IS 'Catálogo de proveedores de seguridad social con configuración de integración';

COMMENT ON COLUMN affiliations.numero_afiliacion_encrypted IS 'Número de afiliación cifrado usando pgcrypto para protección de datos sensibles';
COMMENT ON COLUMN affiliations.consentimiento_arco IS 'Consentimiento del empleado para tratamiento de datos personales (cumplimiento ARCO)';
COMMENT ON COLUMN affiliations.integration_status IS 'Estado de integración con API externa: pending, success, failed, manual';
COMMENT ON COLUMN affiliation_providers.api_enabled IS 'Indica si el proveedor tiene API disponible para integración automática';
COMMENT ON COLUMN affiliation_providers.numero_afiliacion_pattern IS 'Expresión regular para validar formato de número de afiliación';

-- =====================================================
-- 9. POLÍTICAS DE RETENCIÓN Y ELIMINACIÓN
-- =====================================================
COMMENT ON TABLE affiliations IS 'POLÍTICA DE RETENCIÓN: Los datos de afiliaciones retiradas se conservan por 10 años desde la fecha de retiro para cumplimiento legal. Después pueden ser anonimizados o eliminados conforme política de la empresa.';

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
