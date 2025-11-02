-- Seed data: 30 empleados ficticios + usuarios + contratos
-- Ejecutar después de 001_initial_schema.sql

-- Variables para IDs de roles (usar los generados en schema)
DO $$
DECLARE
    role_admin_id UUID;
    role_rh_id UUID;
    role_employee_id UUID;
    user_ids UUID[];
    employee_ids UUID[];
    i INTEGER;
BEGIN
    -- Obtener IDs de roles
    SELECT id INTO role_admin_id FROM roles WHERE name = 'admin';
    SELECT id INTO role_rh_id FROM roles WHERE name = 'rh';
    SELECT id INTO role_employee_id FROM roles WHERE name = 'employee';

    -- Usuario admin
    INSERT INTO users (email, password_hash, role_id) VALUES
    ('admin@talentonet.com', '$2b$10$Vp2PY0aLL/qW01ksf5ZP1eULtdQkIt6OS0blvfvjMnQp/kkAuLri6', role_admin_id);

    -- Usuario RH
    INSERT INTO users (email, password_hash, role_id) VALUES
    ('rh@talentonet.com', '$2b$10$Vp2PY0aLL/qW01ksf5ZP1eULtdQkIt6OS0blvfvjMnQp/kkAuLri6', role_rh_id);

    -- Crear 30 empleados con usuarios
    FOR i IN 1..30 LOOP
        DECLARE
            new_user_id UUID;
            new_employee_id UUID;
            new_contract_id UUID;
            hire_year INTEGER;
            base_salary DECIMAL(15,2);
        BEGIN
            new_user_id := uuid_generate_v4();
            new_employee_id := uuid_generate_v4();
            hire_year := 2020 + (i % 5); -- Años entre 2020-2024
            base_salary := 1300000 + (i * 150000); -- Salarios entre 1.3M y 5.8M

            -- Insertar usuario
            INSERT INTO users (id, email, password_hash, role_id)
            VALUES (
                new_user_id,
                'empleado' || i || '@talentonet.com',
                '$2b$10$rH8Q3Z9X1Y2W3E4R5T6Y7u8I9O0P1Q2W3E4R5T6Y7U8I9O0P1Q2W3',
                role_employee_id
            );

            -- Insertar empleado
            INSERT INTO employees (
                id, user_id, identification_type, identification_number,
                first_name, last_name, date_of_birth, gender, phone,
                address, city, department, hire_date, status
            ) VALUES (
                new_employee_id,
                new_user_id,
                CASE WHEN i % 10 = 0 THEN 'CE' ELSE 'CC' END,
                (1000000000 + i * 123456)::VARCHAR,
                CASE (i % 10)
                    WHEN 0 THEN 'Juan'
                    WHEN 1 THEN 'María'
                    WHEN 2 THEN 'Carlos'
                    WHEN 3 THEN 'Ana'
                    WHEN 4 THEN 'Luis'
                    WHEN 5 THEN 'Laura'
                    WHEN 6 THEN 'Pedro'
                    WHEN 7 THEN 'Sofía'
                    WHEN 8 THEN 'Diego'
                    ELSE 'Valentina'
                END,
                CASE (i % 8)
                    WHEN 0 THEN 'García'
                    WHEN 1 THEN 'Rodríguez'
                    WHEN 2 THEN 'Martínez'
                    WHEN 3 THEN 'Hernández'
                    WHEN 4 THEN 'López'
                    WHEN 5 THEN 'González'
                    WHEN 6 THEN 'Pérez'
                    ELSE 'Sánchez'
                END,
                DATE '1985-01-01' + (i * 200 || ' days')::INTERVAL,
                CASE WHEN i % 2 = 0 THEN 'M' ELSE 'F' END,
                '300' || LPAD(i::TEXT, 7, '0'),
                'Calle ' || i || ' # ' || (i+10) || '-' || (i*2),
                CASE (i % 5)
                    WHEN 0 THEN 'Bogotá'
                    WHEN 1 THEN 'Medellín'
                    WHEN 2 THEN 'Cali'
                    WHEN 3 THEN 'Barranquilla'
                    ELSE 'Cartagena'
                END,
                CASE (i % 5)
                    WHEN 0 THEN 'Cundinamarca'
                    WHEN 1 THEN 'Antioquia'
                    WHEN 2 THEN 'Valle del Cauca'
                    WHEN 3 THEN 'Atlántico'
                    ELSE 'Bolívar'
                END,
                DATE (hire_year || '-' || LPAD(((i % 12) + 1)::TEXT, 2, '0') || '-01'),
                CASE WHEN i % 15 = 0 THEN 'inactive' ELSE 'active' END
            );

            -- Insertar contrato actual
            INSERT INTO contracts (
                employee_id, contract_type, position, department,
                salary, start_date, is_current
            ) VALUES (
                new_employee_id,
                CASE (i % 4)
                    WHEN 0 THEN 'indefinido'
                    WHEN 1 THEN 'fijo'
                    WHEN 2 THEN 'obra_labor'
                    ELSE 'prestacion_servicios'
                END,
                CASE (i % 8)
                    WHEN 0 THEN 'Desarrollador Senior'
                    WHEN 1 THEN 'Analista de Datos'
                    WHEN 2 THEN 'Diseñador UX'
                    WHEN 3 THEN 'Gerente de Proyecto'
                    WHEN 4 THEN 'Desarrollador Junior'
                    WHEN 5 THEN 'Contador'
                    WHEN 6 THEN 'Asistente Administrativo'
                    ELSE 'Especialista de Soporte'
                END,
                CASE (i % 5)
                    WHEN 0 THEN 'Tecnología'
                    WHEN 1 THEN 'Finanzas'
                    WHEN 2 THEN 'Recursos Humanos'
                    WHEN 3 THEN 'Ventas'
                    ELSE 'Marketing'
                END,
                base_salary,
                DATE (hire_year || '-' || LPAD(((i % 12) + 1)::TEXT, 2, '0') || '-01'),
                true
            ) RETURNING id INTO new_contract_id;

            -- Insertar afiliaciones con nueva estructura
            INSERT INTO affiliations (employee_id, tipo, proveedor, codigo_proveedor, numero_afiliacion_plain, fecha_afiliacion, estado)
            VALUES 
                (new_employee_id, 'EPS', 
                 CASE (i % 3) WHEN 0 THEN 'SURA EPS' WHEN 1 THEN 'Sanitas' ELSE 'Compensar' END,
                 'EPS00' || (i % 3 + 1), 'AFF-EPS-' || LPAD(i::TEXT, 6, '0'),
                 DATE (hire_year || '-' || LPAD(((i % 12) + 1)::TEXT, 2, '0') || '-01'), 'activo'),
                (new_employee_id, 'AFP',
                 CASE (i % 3) WHEN 0 THEN 'Porvenir' WHEN 1 THEN 'Protección' ELSE 'Colfondos' END,
                 'AFP00' || (i % 3 + 1), 'AFF-AFP-' || LPAD(i::TEXT, 6, '0'),
                 DATE (hire_year || '-' || LPAD(((i % 12) + 1)::TEXT, 2, '0') || '-01'), 'activo'),
                (new_employee_id, 'ARL',
                 CASE (i % 2) WHEN 0 THEN 'SURA ARL' ELSE 'Positiva' END,
                 'ARL00' || (i % 2 + 1), 'AFF-ARL-' || LPAD(i::TEXT, 6, '0'),
                 DATE (hire_year || '-' || LPAD(((i % 12) + 1)::TEXT, 2, '0') || '-01'), 'activo');

            -- Insertar nómina de los últimos 3 meses para empleados activos
            IF i % 15 != 0 THEN
                FOR j IN 0..2 LOOP
                    DECLARE
                        payroll_month INTEGER;
                        payroll_year INTEGER;
                        health_ded DECIMAL(15,2);
                        pension_ded DECIMAL(15,2);
                        total_earn DECIMAL(15,2);
                        total_ded DECIMAL(15,2);
                    BEGIN
                        payroll_month := EXTRACT(MONTH FROM CURRENT_DATE - (j || ' months')::INTERVAL);
                        payroll_year := EXTRACT(YEAR FROM CURRENT_DATE - (j || ' months')::INTERVAL);
                        total_earn := base_salary + (i * 10000);
                        health_ded := total_earn * 0.04;
                        pension_ded := total_earn * 0.04;
                        total_ded := health_ded + pension_ded;

                        INSERT INTO payroll_entries (
                            employee_id, contract_id, period_year, period_month,
                            base_salary, total_earnings, health_deduction, pension_deduction,
                            total_deductions, net_pay, status
                        ) VALUES (
                            new_employee_id, new_contract_id, payroll_year, payroll_month,
                            base_salary, total_earn, health_ded, pension_ded,
                            total_ded, total_earn - total_ded,
                            CASE WHEN j = 0 THEN 'draft' ELSE 'paid' END
                        );
                    END;
                END LOOP;
            END IF;

        END;
    END LOOP;

    RAISE NOTICE 'Seed completado: 30 empleados, contratos, afiliaciones y nóminas creados';
END $$;
