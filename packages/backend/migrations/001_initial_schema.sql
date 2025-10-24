-- TalentoNet Database Schema
-- PostgreSQL 16+

-- Extension para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Tabla de empleados
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    identification_type VARCHAR(20) NOT NULL, -- CC, CE, TI, PAS
    identification_number VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10), -- M, F, Otro
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    department VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Colombia',
    hire_date DATE NOT NULL,
    termination_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT age_check CHECK (date_of_birth < CURRENT_DATE - INTERVAL '18 years')
);

-- Índices para empleados
CREATE INDEX idx_employees_identification ON employees(identification_number);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_hire_date ON employees(hire_date);

-- Tabla de contratos
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    contract_type VARCHAR(50) NOT NULL, -- indefinido, fijo, obra_labor, prestacion_servicios
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    salary DECIMAL(15,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT salary_positive CHECK (salary > 0),
    CONSTRAINT dates_valid CHECK (end_date IS NULL OR end_date > start_date)
);

CREATE INDEX idx_contracts_employee ON contracts(employee_id);
CREATE INDEX idx_contracts_current ON contracts(is_current) WHERE is_current = true;

-- Tabla de afiliaciones (EPS, AFP, ARL, Caja)
CREATE TABLE affiliations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL, -- EPS, AFP, ARL, CAJA
    entity_name VARCHAR(100) NOT NULL,
    entity_code VARCHAR(50),
    affiliation_number VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_affiliations_employee ON affiliations(employee_id);
CREATE INDEX idx_affiliations_type ON affiliations(entity_type);

-- Tabla de nómina
CREATE TABLE payroll_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,
    base_salary DECIMAL(15,2) NOT NULL,
    overtime_hours DECIMAL(8,2) DEFAULT 0,
    overtime_amount DECIMAL(15,2) DEFAULT 0,
    bonuses DECIMAL(15,2) DEFAULT 0,
    commissions DECIMAL(15,2) DEFAULT 0,
    total_earnings DECIMAL(15,2) NOT NULL,
    health_deduction DECIMAL(15,2) DEFAULT 0, -- 4%
    pension_deduction DECIMAL(15,2) DEFAULT 0, -- 4%
    solidarity_fund DECIMAL(15,2) DEFAULT 0,
    other_deductions DECIMAL(15,2) DEFAULT 0,
    total_deductions DECIMAL(15,2) NOT NULL,
    net_pay DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- draft, approved, paid
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT period_month_valid CHECK (period_month >= 1 AND period_month <= 12),
    CONSTRAINT amounts_positive CHECK (base_salary >= 0 AND total_earnings >= 0),
    UNIQUE(employee_id, period_year, period_month)
);

CREATE INDEX idx_payroll_period ON payroll_entries(period_year, period_month);
CREATE INDEX idx_payroll_employee ON payroll_entries(employee_id);
CREATE INDEX idx_payroll_status ON payroll_entries(status);

-- Tabla de documentos
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- contrato, cedula, certificado_bancario, etc
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    s3_key VARCHAR(500) NOT NULL,
    s3_bucket VARCHAR(100) NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_employee ON documents(employee_id);
CREATE INDEX idx_documents_type ON documents(document_type);

-- Tabla de auditoría
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT
    entity_type VARCHAR(100) NOT NULL, -- employees, contracts, payroll, etc
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliations_updated_at BEFORE UPDATE ON affiliations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_entries_updated_at BEFORE UPDATE ON payroll_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar roles base
INSERT INTO roles (name, description) VALUES
    ('admin', 'Administrador del sistema con acceso completo'),
    ('rh', 'Recursos Humanos - gestión de empleados y nómina'),
    ('employee', 'Empleado - acceso limitado a su información');

COMMENT ON TABLE employees IS 'Tabla principal de empleados con información personal';
COMMENT ON TABLE contracts IS 'Contratos laborales históricos y actuales';
COMMENT ON TABLE payroll_entries IS 'Registros de nómina por empleado y periodo';
COMMENT ON TABLE affiliations IS 'Afiliaciones a entidades de seguridad social';
COMMENT ON TABLE documents IS 'Referencias a documentos almacenados en S3';
COMMENT ON TABLE audit_logs IS 'Registro de auditoría de todas las operaciones críticas';
