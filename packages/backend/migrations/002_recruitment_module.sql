-- =====================================================
-- MIGRACIÓN: Módulo de Selección y Contratación
-- Versión: 002
-- Fecha: 2025-10-24
-- Descripción: Tablas para gestión de vacantes, candidatos, entrevistas y proceso de contratación
-- =====================================================

-- =====================================================
-- 1. TABLA: vacancies (Vacantes)
-- =====================================================
CREATE TABLE IF NOT EXISTS vacancies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información básica
    departamento VARCHAR(100) NOT NULL,
    cargo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    
    -- Requisitos
    experiencia_requerida VARCHAR(255),
    nivel_educacion VARCHAR(100),
    habilidades_requeridas TEXT[],
    
    -- Información salarial
    salario_min DECIMAL(12, 2),
    salario_max DECIMAL(12, 2),
    
    -- Fechas
    fecha_solicitud TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    
    -- Estado
    estado VARCHAR(50) NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta', 'en_proceso', 'cerrada', 'cancelada')),
    
    -- Auditoría
    creador_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para vacancies
CREATE INDEX idx_vacancies_estado ON vacancies(estado);
CREATE INDEX idx_vacancies_departamento ON vacancies(departamento);
CREATE INDEX idx_vacancies_fecha_solicitud ON vacancies(fecha_solicitud DESC);
CREATE INDEX idx_vacancies_creador ON vacancies(creador_id);

-- =====================================================
-- 2. TABLA: candidates (Candidatos)
-- =====================================================
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relación con vacante
    vacancy_id UUID NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    
    -- Información personal
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    fecha_nacimiento DATE,
    
    -- Información laboral
    experiencia_anios INTEGER,
    ultimo_cargo VARCHAR(150),
    ultima_empresa VARCHAR(200),
    nivel_educacion VARCHAR(100),
    
    -- Expectativas
    expectativa_salarial DECIMAL(12, 2),
    disponibilidad VARCHAR(50),
    
    -- Proceso
    fecha_postulacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_proceso VARCHAR(50) NOT NULL DEFAULT 'postulado' 
        CHECK (estado_proceso IN ('postulado', 'preseleccionado', 'entrevistado', 'pruebas_tecnicas', 'aprobado', 'rechazado', 'contratado')),
    
    -- Notas y observaciones
    notas TEXT,
    puntuacion INTEGER CHECK (puntuacion >= 0 AND puntuacion <= 100),
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para candidates
CREATE INDEX idx_candidates_vacancy ON candidates(vacancy_id);
CREATE INDEX idx_candidates_cedula ON candidates(cedula);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_estado ON candidates(estado_proceso);
CREATE INDEX idx_candidates_fecha_postulacion ON candidates(fecha_postulacion DESC);

-- Constraint: cédula única por candidato activo (no rechazado ni contratado)
CREATE UNIQUE INDEX idx_candidates_cedula_activo 
    ON candidates(cedula) 
    WHERE estado_proceso NOT IN ('rechazado', 'contratado');

-- =====================================================
-- 3. TABLA: candidate_state_history (Historial de estados)
-- =====================================================
CREATE TABLE IF NOT EXISTS candidate_state_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relación
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    
    -- Cambio de estado
    estado_anterior VARCHAR(50) NOT NULL,
    estado_nuevo VARCHAR(50) NOT NULL,
    
    -- Auditoría
    usuario_id UUID NOT NULL REFERENCES users(id),
    fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    comentario TEXT,
    
    -- Metadata
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Índices para candidate_state_history
CREATE INDEX idx_candidate_state_history_candidate ON candidate_state_history(candidate_id);
CREATE INDEX idx_candidate_state_history_fecha ON candidate_state_history(fecha DESC);
CREATE INDEX idx_candidate_state_history_usuario ON candidate_state_history(usuario_id);

-- =====================================================
-- 4. TABLA: interviews (Entrevistas)
-- =====================================================
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relación
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    
    -- Programación
    fecha TIMESTAMP WITH TIME ZONE NOT NULL,
    duracion_minutos INTEGER DEFAULT 60,
    
    -- Entrevistador
    entrevistador_id UUID NOT NULL REFERENCES users(id),
    
    -- Tipo de entrevista
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('telefonica', 'presencial', 'virtual', 'tecnica', 'psicotecnica')),
    
    -- Resultado
    resultado VARCHAR(50) CHECK (resultado IN ('pendiente', 'aprobado', 'rechazado', 'reagendar')),
    puntuacion INTEGER CHECK (puntuacion >= 0 AND puntuacion <= 100),
    
    -- Notas
    notas TEXT,
    fortalezas TEXT[],
    debilidades TEXT[],
    
    -- Estado
    estado VARCHAR(50) NOT NULL DEFAULT 'programada' CHECK (estado IN ('programada', 'completada', 'cancelada', 'reprogramada')),
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para interviews
CREATE INDEX idx_interviews_candidate ON interviews(candidate_id);
CREATE INDEX idx_interviews_entrevistador ON interviews(entrevistador_id);
CREATE INDEX idx_interviews_fecha ON interviews(fecha);
CREATE INDEX idx_interviews_tipo ON interviews(tipo);
CREATE INDEX idx_interviews_estado ON interviews(estado);

-- =====================================================
-- 5. EXTENDER TABLA: documents (ya existe, agregar soporte para candidatos)
-- =====================================================
-- La tabla documents ya existe desde la migración 001
-- Solo agregamos un índice adicional para optimizar búsquedas por candidato
CREATE INDEX IF NOT EXISTS idx_documents_candidate 
    ON documents(owner_id) 
    WHERE owner_type = 'candidate';

-- =====================================================
-- 6. TABLA: contracts (Contratos generados)
-- =====================================================
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relación
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    employee_id UUID REFERENCES employees(id),
    
    -- Información del contrato
    tipo_contrato VARCHAR(50) NOT NULL CHECK (tipo_contrato IN ('fijo', 'indefinido', 'obra_labor', 'prestacion_servicios', 'aprendizaje')),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    
    -- Información salarial
    salario_base DECIMAL(12, 2) NOT NULL,
    cargo VARCHAR(150) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    
    -- Documento generado
    document_id UUID REFERENCES documents(id),
    pdf_url TEXT,
    
    -- Estado
    estado VARCHAR(50) NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'generado', 'enviado', 'firmado', 'activo', 'cancelado')),
    
    -- Firmas
    fecha_firma_empleado TIMESTAMP WITH TIME ZONE,
    fecha_firma_empresa TIMESTAMP WITH TIME ZONE,
    
    -- Auditoría
    generado_por UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para contracts
CREATE INDEX idx_contracts_candidate ON contracts(candidate_id);
CREATE INDEX idx_contracts_employee ON contracts(employee_id);
CREATE INDEX idx_contracts_estado ON contracts(estado);
CREATE INDEX idx_contracts_generado_por ON contracts(generado_por);

-- =====================================================
-- 7. TRIGGERS: Actualización automática de timestamps
-- =====================================================

-- Trigger para vacancies
CREATE TRIGGER update_vacancies_updated_at
    BEFORE UPDATE ON vacancies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para candidates
CREATE TRIGGER update_candidates_updated_at
    BEFORE UPDATE ON candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para interviews
CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para contracts
CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. FUNCIÓN: Registrar automáticamente cambios de estado
-- =====================================================
CREATE OR REPLACE FUNCTION log_candidate_state_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar si el estado realmente cambió
    IF OLD.estado_proceso IS DISTINCT FROM NEW.estado_proceso THEN
        INSERT INTO candidate_state_history (
            candidate_id,
            estado_anterior,
            estado_nuevo,
            usuario_id,
            comentario
        ) VALUES (
            NEW.id,
            COALESCE(OLD.estado_proceso, 'nuevo'),
            NEW.estado_proceso,
            COALESCE(current_setting('app.current_user_id', true)::UUID, '00000000-0000-0000-0000-000000000000'::UUID),
            'Cambio automático de estado'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar cambios de estado automáticamente
CREATE TRIGGER candidate_state_change_logger
    AFTER UPDATE ON candidates
    FOR EACH ROW
    EXECUTE FUNCTION log_candidate_state_change();

-- =====================================================
-- 9. COMENTARIOS EN TABLAS (Documentación)
-- =====================================================
COMMENT ON TABLE vacancies IS 'Vacantes o posiciones abiertas para contratación';
COMMENT ON TABLE candidates IS 'Candidatos postulados a vacantes';
COMMENT ON TABLE candidate_state_history IS 'Historial de cambios de estado de candidatos (auditoría)';
COMMENT ON TABLE interviews IS 'Entrevistas programadas y realizadas a candidatos';
COMMENT ON TABLE contracts IS 'Contratos generados para candidatos aprobados';

COMMENT ON COLUMN vacancies.estado IS 'Estados: abierta, en_proceso, cerrada, cancelada';
COMMENT ON COLUMN candidates.estado_proceso IS 'Estados: postulado, preseleccionado, entrevistado, pruebas_tecnicas, aprobado, rechazado, contratado';
COMMENT ON COLUMN interviews.tipo IS 'Tipos: telefonica, presencial, virtual, tecnica, psicotecnica';
COMMENT ON COLUMN contracts.tipo_contrato IS 'Tipos: fijo, indefinido, obra_labor, prestacion_servicios, aprendizaje';

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
