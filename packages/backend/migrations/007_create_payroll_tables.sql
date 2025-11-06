-- =====================================================
-- Migración 007: Módulo de Nómina (Payroll)
-- =====================================================
-- Tablas para gestión de períodos, novedades, liquidaciones y desprendibles
-- Compatible con reglas colombianas de nómina

-- Configuración de parámetros de nómina
CREATE TABLE payroll_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payroll_config_key ON payroll_config(key);

COMMENT ON TABLE payroll_config IS 'Parámetros configurables para cálculo de nómina (porcentajes, valores base, etc.)';

-- Períodos de nómina
CREATE TABLE payroll_period (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('quincenal', 'mensual')),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'liquidado', 'cerrado', 'aprobado')),
    descripcion TEXT,
    created_by UUID REFERENCES users(id),
    liquidated_by UUID REFERENCES users(id),
    liquidated_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_fecha_periodo CHECK (fecha_fin >= fecha_inicio)
);

CREATE INDEX idx_payroll_period_estado ON payroll_period(estado);
CREATE INDEX idx_payroll_period_fechas ON payroll_period(fecha_inicio, fecha_fin);

COMMENT ON TABLE payroll_period IS 'Períodos de nómina (quincenal/mensual)';
COMMENT ON COLUMN payroll_period.estado IS 'abierto: editable | liquidado: calculado | aprobado: firmado por gerencia | cerrado: inmutable';

-- Novedades de nómina
CREATE TABLE payroll_novedad (
    id SERIAL PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    payroll_period_id INTEGER REFERENCES payroll_period(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('devengo', 'deduccion')),
    valor DECIMAL(15, 2) NOT NULL,
    cantidad DECIMAL(10, 2) DEFAULT 1,
    fecha DATE NOT NULL,
    comentario TEXT,
    metadata JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payroll_novedad_employee ON payroll_novedad(employee_id);
CREATE INDEX idx_payroll_novedad_period ON payroll_novedad(payroll_period_id);
CREATE INDEX idx_payroll_novedad_tipo ON payroll_novedad(tipo);

COMMENT ON TABLE payroll_novedad IS 'Novedades que afectan la nómina (horas extras, bonos, préstamos, etc.)';
COMMENT ON COLUMN payroll_novedad.tipo IS 'Ejemplo: horas_extras, comision, bono, prestamo, embargo';
COMMENT ON COLUMN payroll_novedad.cantidad IS 'Para horas extras, número de horas; para otros casos, usualmente 1';

-- Liquidaciones de nómina (registro por empleado)
CREATE TABLE payroll_entry (
    id SERIAL PRIMARY KEY,
    payroll_period_id INTEGER NOT NULL REFERENCES payroll_period(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Devengos
    salario_base DECIMAL(15, 2) NOT NULL DEFAULT 0,
    horas_extras DECIMAL(15, 2) DEFAULT 0,
    comisiones DECIMAL(15, 2) DEFAULT 0,
    bonificaciones DECIMAL(15, 2) DEFAULT 0,
    otros_devengos DECIMAL(15, 2) DEFAULT 0,
    total_devengado DECIMAL(15, 2) NOT NULL,
    
    -- Deducciones
    salud DECIMAL(15, 2) DEFAULT 0,
    pension DECIMAL(15, 2) DEFAULT 0,
    fondo_solidaridad DECIMAL(15, 2) DEFAULT 0,
    retencion_fuente DECIMAL(15, 2) DEFAULT 0,
    otras_deducciones DECIMAL(15, 2) DEFAULT 0,
    total_deducido DECIMAL(15, 2) NOT NULL,
    
    -- Neto a pagar
    neto DECIMAL(15, 2) NOT NULL,
    
    -- Detalles adicionales (JSON con breakdown completo)
    detalles_json JSONB,
    
    -- Auditoría
    calculated_by UUID REFERENCES users(id),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_payroll_employee_period UNIQUE (payroll_period_id, employee_id),
    CONSTRAINT check_neto_calculation CHECK (neto = total_devengado - total_deducido)
);

CREATE INDEX idx_payroll_entry_period ON payroll_entry(payroll_period_id);
CREATE INDEX idx_payroll_entry_employee ON payroll_entry(employee_id);
CREATE INDEX idx_payroll_entry_calculated_at ON payroll_entry(calculated_at);

COMMENT ON TABLE payroll_entry IS 'Liquidación de nómina por empleado y período';
COMMENT ON COLUMN payroll_entry.detalles_json IS 'Detalle completo del cálculo, novedades aplicadas, base de cálculo';

-- Desprendibles de pago (payslips)
CREATE TABLE payslip (
    id SERIAL PRIMARY KEY,
    payroll_entry_id INTEGER NOT NULL REFERENCES payroll_entry(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    pdf_s3_key VARCHAR(500),
    pdf_url TEXT,
    file_size INTEGER,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_payslip_per_entry UNIQUE (payroll_entry_id)
);

CREATE INDEX idx_payslip_employee ON payslip(employee_id);
CREATE INDEX idx_payslip_generated_at ON payslip(generated_at);

COMMENT ON TABLE payslip IS 'Desprendibles de pago en PDF';
COMMENT ON COLUMN payslip.pdf_s3_key IS 'Ruta del archivo en MinIO/S3';

-- Logs de exportación de archivos de nómina
CREATE TABLE payroll_export_log (
    id SERIAL PRIMARY KEY,
    payroll_period_id INTEGER NOT NULL REFERENCES payroll_period(id) ON DELETE CASCADE,
    tipo_exportacion VARCHAR(50) NOT NULL,
    formato VARCHAR(20) NOT NULL,
    file_s3_key VARCHAR(500),
    file_url TEXT,
    total_registros INTEGER,
    exported_by UUID REFERENCES users(id),
    exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payroll_export_period ON payroll_export_log(payroll_period_id);
CREATE INDEX idx_payroll_export_tipo ON payroll_export_log(tipo_exportacion);

COMMENT ON TABLE payroll_export_log IS 'Registro de exportaciones (Yéminus, Aportes en Línea, CSV, Excel)';
COMMENT ON COLUMN payroll_export_log.tipo_exportacion IS 'yeminus, aportes_linea, csv, excel';

-- =====================================================
-- Datos iniciales de configuración
-- =====================================================

-- Configuración de porcentajes para Colombia (2024)
INSERT INTO payroll_config (key, value, description) VALUES
('porcentaje_salud_empleado', '{"value": 4.0, "type": "percentage"}', 'Porcentaje de salud a cargo del empleado (4%)'),
('porcentaje_pension_empleado', '{"value": 4.0, "type": "percentage"}', 'Porcentaje de pensión a cargo del empleado (4%)'),
('porcentaje_fondo_solidaridad', '{"value": 1.0, "type": "percentage", "salario_minimo": 4}', 'Fondo de solidaridad pensional para salarios > 4 SMMLV'),
('salario_minimo_legal', '{"value": 1300000, "year": 2024}', 'Salario mínimo mensual legal vigente Colombia 2024'),
('auxilio_transporte', '{"value": 162000, "year": 2024}', 'Auxilio de transporte Colombia 2024'),
('horas_extras_recargo_diurno', '{"value": 25, "type": "percentage"}', 'Recargo hora extra diurna (25%)'),
('horas_extras_recargo_nocturno', '{"value": 75, "type": "percentage"}', 'Recargo hora extra nocturna (75%)'),
('horas_extras_recargo_dominical', '{"value": 75, "type": "percentage"}', 'Recargo hora dominical/festiva (75%)'),
('retencion_fuente_base', '{"uvt": 95, "uvt_value": 42412, "year": 2024}', 'Base de retención en la fuente (95 UVT)'),
('tipos_novedad_devengo', '{"tipos": ["horas_extras_diurnas", "horas_extras_nocturnas", "horas_dominicales", "comision_ventas", "bono_productividad", "auxilio_rodamiento", "viaticos", "prima_extralegal"]}', 'Tipos de novedades que son devengos'),
('tipos_novedad_deduccion', '{"tipos": ["prestamo_empresa", "embargo_judicial", "retencion_cooperativa", "cuota_sindical", "fondo_empleados", "libranza", "anticipo"]}', 'Tipos de novedades que son deducciones');

-- =====================================================
-- Triggers para updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_payroll_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payroll_config_updated_at
    BEFORE UPDATE ON payroll_config
    FOR EACH ROW EXECUTE FUNCTION update_payroll_updated_at();

CREATE TRIGGER trigger_payroll_period_updated_at
    BEFORE UPDATE ON payroll_period
    FOR EACH ROW EXECUTE FUNCTION update_payroll_updated_at();

CREATE TRIGGER trigger_payroll_novedad_updated_at
    BEFORE UPDATE ON payroll_novedad
    FOR EACH ROW EXECUTE FUNCTION update_payroll_updated_at();

CREATE TRIGGER trigger_payroll_entry_updated_at
    BEFORE UPDATE ON payroll_entry
    FOR EACH ROW EXECUTE FUNCTION update_payroll_updated_at();
