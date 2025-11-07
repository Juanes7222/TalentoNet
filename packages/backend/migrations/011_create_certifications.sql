-- Migración 011: Sistema de Certificaciones Laborales
-- Descripción: Permite gestionar solicitudes y generación de certificados laborales en PDF

-- Tabla de tipos de certificados
CREATE TABLE certification_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    requiere_aprobacion BOOLEAN DEFAULT false,
    template_html TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de solicitudes de certificaciones
CREATE TABLE certification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información del solicitante
    requester_nombre VARCHAR(200) NOT NULL,
    requester_email VARCHAR(255) NOT NULL,
    requester_tipo VARCHAR(50) NOT NULL CHECK (requester_tipo IN ('empleado', 'externo', 'rrhh')),
    
    -- Empleado certificado
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Detalles de la certificación
    tipo_certificado VARCHAR(100) NOT NULL DEFAULT 'laboral',
    motivo TEXT NOT NULL,
    incluir_salario BOOLEAN DEFAULT false,
    incluir_cargo BOOLEAN DEFAULT true,
    incluir_tiempo_servicio BOOLEAN DEFAULT true,
    
    -- Estado y aprobación
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'generado', 'rechazado', 'enviado')),
    aprobado_por UUID REFERENCES users(id),
    aprobado_en TIMESTAMP WITH TIME ZONE,
    rechazado_motivo TEXT,
    
    -- PDF generado
    pdf_url TEXT,
    pdf_s3_key VARCHAR(500),
    pdf_generated_at TIMESTAMP WITH TIME ZONE,
    
    -- Consentimiento datos sensibles
    consentimiento_datos BOOLEAN DEFAULT false,
    ip_address VARCHAR(50),
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_salario_consentimiento CHECK (
        NOT incluir_salario OR consentimiento_datos = true
    )
);

-- Índices para búsquedas eficientes
CREATE INDEX idx_certification_requests_employee ON certification_requests(employee_id);
CREATE INDEX idx_certification_requests_estado ON certification_requests(estado);
CREATE INDEX idx_certification_requests_requester_email ON certification_requests(requester_email);
CREATE INDEX idx_certification_requests_created_at ON certification_requests(created_at DESC);

-- Insertar tipos de certificados predefinidos
INSERT INTO certification_types (nombre, descripcion, requiere_aprobacion) VALUES
('Certificado Laboral', 'Certificación estándar de vinculación laboral', false),
('Certificado Laboral con Salario', 'Certificación que incluye información salarial', true),
('Certificado de Ingresos', 'Certificación exclusiva de ingresos y retenciones', true),
('Constancia de Tiempo de Servicio', 'Certificación de tiempo laborado en la empresa', false);

-- Comentarios
COMMENT ON TABLE certification_requests IS 'Solicitudes de certificaciones laborales';
COMMENT ON COLUMN certification_requests.requester_tipo IS 'Tipo de solicitante: empleado actual, externo (ex-empleado), o RRHH';
COMMENT ON COLUMN certification_requests.incluir_salario IS 'Si se incluye información salarial requiere consentimiento';
COMMENT ON COLUMN certification_requests.estado IS 'Estado: pendiente → aprobado → generado → enviado';
