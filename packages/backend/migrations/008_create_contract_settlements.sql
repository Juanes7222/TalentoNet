-- =====================================================
-- Migración 008: Liquidación Definitiva de Contratos
-- =====================================================
-- Tabla para liquidaciones de contratos con cálculo de prestaciones sociales
-- Compatible con reglas colombianas (cesantías, primas, vacaciones, indemnizaciones)

-- Tabla principal de liquidaciones
CREATE TABLE contract_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    
    -- Datos base de la liquidación
    fecha_liquidacion DATE NOT NULL,
    fecha_inicio_contrato DATE NOT NULL,
    fecha_fin_contrato DATE NOT NULL,
    dias_trabajados INTEGER NOT NULL,
    ultimo_salario DECIMAL(15, 2) NOT NULL,
    promedio_salario DECIMAL(15, 2), -- Promedio últimos 12 meses si aplica
    
    -- Prestaciones sociales
    cesantias DECIMAL(15, 2) DEFAULT 0,
    intereses_cesantias DECIMAL(15, 2) DEFAULT 0,
    prima_servicios DECIMAL(15, 2) DEFAULT 0,
    vacaciones DECIMAL(15, 2) DEFAULT 0,
    
    -- Indemnizaciones
    indemnizacion DECIMAL(15, 2) DEFAULT 0,
    tipo_indemnizacion VARCHAR(50), -- 'sin_justa_causa', 'terminacion_anticipada', null
    
    -- Otros conceptos
    otros_conceptos DECIMAL(15, 2) DEFAULT 0,
    deducciones DECIMAL(15, 2) DEFAULT 0,
    
    -- Total
    total_liquidacion DECIMAL(15, 2) NOT NULL,
    
    -- Detalles en JSON (breakdown completo, ajustes manuales, observaciones)
    detalle_json JSONB,
    
    -- Estado del proceso
    estado VARCHAR(20) NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'pendiente_aprobacion', 'aprobado', 'pagado', 'rechazado')),
    
    -- Documento PDF
    pdf_s3_key VARCHAR(500),
    pdf_url TEXT,
    pdf_generado_at TIMESTAMP,
    
    -- Aprobación
    aprobado_por UUID REFERENCES users(id),
    aprobado_at TIMESTAMP,
    comentarios_aprobacion TEXT,
    
    -- Rechazo
    rechazado_por UUID REFERENCES users(id),
    rechazado_at TIMESTAMP,
    motivo_rechazo TEXT,
    
    -- Pago
    pagado_at TIMESTAMP,
    referencia_pago VARCHAR(100),
    
    -- Auditoría
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    notas TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricciones
    CONSTRAINT unique_settlement_per_contract UNIQUE (contract_id)
);

-- Índices
CREATE INDEX idx_settlements_employee ON contract_settlements(employee_id);
CREATE INDEX idx_settlements_estado ON contract_settlements(estado);
CREATE INDEX idx_settlements_fecha ON contract_settlements(fecha_liquidacion);
CREATE INDEX idx_settlements_aprobado ON contract_settlements(aprobado_por);

-- Comentarios
COMMENT ON TABLE contract_settlements IS 'Liquidaciones definitivas de contratos con prestaciones sociales';
COMMENT ON COLUMN contract_settlements.cesantias IS 'Cesantías acumuladas (1 mes de salario por año)';
COMMENT ON COLUMN contract_settlements.intereses_cesantias IS 'Intereses sobre cesantías (12% anual)';
COMMENT ON COLUMN contract_settlements.prima_servicios IS 'Prima de servicios proporcional';
COMMENT ON COLUMN contract_settlements.vacaciones IS 'Vacaciones pendientes de pago';
COMMENT ON COLUMN contract_settlements.indemnizacion IS 'Indemnización por despido/terminación anticipada';
COMMENT ON COLUMN contract_settlements.detalle_json IS 'Desglose detallado de cálculos, ajustes manuales y justificaciones';

-- Tabla de auditoría para cambios en liquidaciones
CREATE TABLE contract_settlement_audit (
    id SERIAL PRIMARY KEY,
    settlement_id UUID NOT NULL REFERENCES contract_settlements(id) ON DELETE CASCADE,
    campo_modificado VARCHAR(100) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    justificacion TEXT,
    modificado_por UUID REFERENCES users(id),
    modificado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settlement_audit_settlement ON contract_settlement_audit(settlement_id);
CREATE INDEX idx_settlement_audit_fecha ON contract_settlement_audit(modificado_at);

COMMENT ON TABLE contract_settlement_audit IS 'Registro de auditoría para cambios manuales en liquidaciones';

-- Función para actualizar updated_at
CREATE TRIGGER trigger_settlements_updated_at
    BEFORE UPDATE ON contract_settlements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

