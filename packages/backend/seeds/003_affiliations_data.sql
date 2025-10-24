-- =====================================================
-- SEED: Módulo de Afiliaciones a Seguridad Social
-- Versión: 003
-- Fecha: 2025-10-24
-- Descripción: Datos iniciales de proveedores y afiliaciones de ejemplo
-- =====================================================

-- =====================================================
-- 1. PROVEEDORES DE ARL
-- =====================================================
INSERT INTO affiliation_providers (tipo, nombre, nit, codigo, email, telefono, website, activo, numero_afiliacion_pattern, numero_afiliacion_ejemplo) VALUES
('ARL', 'SURA ARL', '800088702-7', 'ARL001', 'servicioalcliente@arl-sura.co', '018000 514 414', 'https://www.arlsura.com', true, '^[0-9]{10}$', '1234567890'),
('ARL', 'Positiva Compañía de Seguros', '800251440-6', 'ARL002', 'atencionlínea@positiva.gov.co', '01 8000 111 170', 'https://www.positiva.gov.co', true, '^[0-9]{10}$', '0987654321'),
('ARL', 'Seguros Bolívar ARL', '860002503-6', 'ARL003', 'servicio.cliente@segurosbolivar.com', '01 8000 122 003', 'https://www.segurosbolivar.com', true, '^[0-9]{10}$', '1122334455'),
('ARL', 'Liberty Seguros ARL', '860002400-5', 'ARL004', 'contacto@libertyseguros.com.co', '01 8000 518 000', 'https://www.libertyseguros.com.co', true, '^[0-9]{10}$', '5566778899');

-- =====================================================
-- 2. PROVEEDORES DE EPS
-- =====================================================
INSERT INTO affiliation_providers (tipo, nombre, nit, codigo, email, telefono, website, activo, numero_afiliacion_pattern, numero_afiliacion_ejemplo) VALUES
('EPS', 'EPS Sanitas', '800251440-6', 'EPS001', 'servicioalcliente@sanitas.co', '01 8000 919 090', 'https://www.sanitas.co', true, '^[0-9]{12}$', '123456789012'),
('EPS', 'Compensar EPS', '860007336-1', 'EPS002', 'contacto@compensar.com', '444 4002', 'https://www.compensar.com', true, '^[0-9]{12}$', '210987654321'),
('EPS', 'Nueva EPS', '900156264-0', 'EPS003', 'atencion@nuevaeps.com.co', '01 8000 424 023', 'https://www.nuevaeps.com.co', true, '^[0-9]{12}$', '334455667788'),
('EPS', 'Salud Total EPS', '800130907-1', 'EPS004', 'servicioalcliente@saludtotal.com.co', '01 8000 116 116', 'https://www.saludtotal.com.co', true, '^[0-9]{12}$', '998877665544'),
('EPS', 'Sura EPS', '800088702-7', 'EPS005', 'servicio.eps@segurossura.com.co', '01 8000 518 888', 'https://www.epssura.com', true, '^[0-9]{12}$', '112233445566');

-- =====================================================
-- 3. PROVEEDORES DE AFP (Fondos de Pensiones)
-- =====================================================
INSERT INTO affiliation_providers (tipo, nombre, nit, codigo, email, telefono, website, activo, numero_afiliacion_pattern, numero_afiliacion_ejemplo) VALUES
('AFP', 'Porvenir', '800139762-5', 'AFP001', 'contactenos@porvenir.com.co', '01 8000 514 000', 'https://www.porvenir.com.co', true, '^[0-9]{11}$', '12345678901'),
('AFP', 'Protección', '800146009-5', 'AFP002', 'servicio@proteccion.com.co', '01 8000 111 414', 'https://www.proteccion.com', true, '^[0-9]{11}$', '98765432109'),
('AFP', 'Colfondos', '860066942-7', 'AFP003', 'linea@colfondos.com.co', '01 8000 916 670', 'https://www.colfondos.com.co', true, '^[0-9]{11}$', '55443322110'),
('AFP', 'Old Mutual', '860047271-8', 'AFP004', 'contacto@oldmutual.com.co', '01 8000 122 626', 'https://www.oldmutual.com.co', true, '^[0-9]{11}$', '11223344556');

-- =====================================================
-- 4. PROVEEDORES DE CAJAS DE COMPENSACIÓN
-- =====================================================
INSERT INTO affiliation_providers (tipo, nombre, nit, codigo, email, telefono, website, activo, numero_afiliacion_pattern, numero_afiliacion_ejemplo) VALUES
('CAJA', 'Compensar', '860007336-1', 'CAJA001', 'contacto@compensar.com', '444 4002', 'https://www.compensar.com', true, '^[0-9]{10}$', '1234567890'),
('CAJA', 'Colsubsidio', '860007336-1', 'CAJA002', 'contactenos@colsubsidio.com', '756 5656', 'https://www.colsubsidio.com', true, '^[0-9]{10}$', '9876543210'),
('CAJA', 'Cafam', '860007386-5', 'CAJA003', 'servicioalcliente@cafam.com.co', '01 8000 113 033', 'https://www.cafam.com.co', true, '^[0-9]{10}$', '5544332211'),
('CAJA', 'Comfenalco Valle', '890303093-3', 'CAJA004', 'contacto@comfenalcovalle.com.co', '01 8000 954 646', 'https://www.comfenalcovalle.com.co', true, '^[0-9]{10}$', '1122334455');

-- =====================================================
-- 5. AFILIACIONES DE EJEMPLO (usando empleados del seed anterior)
-- =====================================================
-- Nota: Los números de afiliación deben ser cifrados. 
-- En producción esto se hace desde el backend con la clave secreta.
-- Aquí usamos ejemplos para demostración.

-- Obtener IDs de empleados y usuarios para los ejemplos
DO $$
DECLARE
    emp_juan_id UUID;
    emp_maria_id UUID;
    admin_user_id UUID;
    encryption_key TEXT := 'TalentoNetSecretKey2025'; -- En producción viene de variable de entorno
BEGIN
    -- Obtener IDs
    SELECT id INTO emp_juan_id FROM employees WHERE identification_number = '1234567890' LIMIT 1;
    SELECT id INTO emp_maria_id FROM employees WHERE identification_number = '0987654321' LIMIT 1;
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@talentonet.com' LIMIT 1;
    
    -- Solo insertar si encontramos los empleados
    IF emp_juan_id IS NOT NULL AND admin_user_id IS NOT NULL THEN
        -- Afiliación ARL para Juan Pérez
        INSERT INTO affiliations (
            employee_id,
            tipo,
            proveedor,
            numero_afiliacion_encrypted,
            fecha_afiliacion,
            estado,
            comprobante_s3_key,
            comprobante_filename,
            consentimiento_arco,
            fecha_consentimiento,
            integration_status,
            created_by
        ) VALUES (
            emp_juan_id,
            'ARL',
            'SURA ARL',
            encrypt_affiliation_number('1234567890', encryption_key),
            '2024-01-15',
            'activo',
            'affiliations/arl_juan_sura_2024.pdf',
            'arl_juan_sura_2024.pdf',
            true,
            '2024-01-15 10:00:00-05',
            'manual',
            admin_user_id
        );
        
        -- Afiliación EPS para Juan Pérez
        INSERT INTO affiliations (
            employee_id,
            tipo,
            proveedor,
            numero_afiliacion_encrypted,
            fecha_afiliacion,
            estado,
            comprobante_s3_key,
            comprobante_filename,
            consentimiento_arco,
            fecha_consentimiento,
            integration_status,
            created_by
        ) VALUES (
            emp_juan_id,
            'EPS',
            'EPS Sanitas',
            encrypt_affiliation_number('123456789012', encryption_key),
            '2024-01-15',
            'activo',
            'affiliations/eps_juan_sanitas_2024.pdf',
            'eps_juan_sanitas_2024.pdf',
            true,
            '2024-01-15 10:00:00-05',
            'manual',
            admin_user_id
        );
        
        -- Afiliación AFP para Juan Pérez
        INSERT INTO affiliations (
            employee_id,
            tipo,
            proveedor,
            numero_afiliacion_encrypted,
            fecha_afiliacion,
            estado,
            comprobante_s3_key,
            comprobante_filename,
            consentimiento_arco,
            fecha_consentimiento,
            integration_status,
            created_by
        ) VALUES (
            emp_juan_id,
            'AFP',
            'Porvenir',
            encrypt_affiliation_number('12345678901', encryption_key),
            '2024-01-15',
            'activo',
            'affiliations/afp_juan_porvenir_2024.pdf',
            'afp_juan_porvenir_2024.pdf',
            true,
            '2024-01-15 10:00:00-05',
            'manual',
            admin_user_id
        );
        
        -- Afiliación Caja de Compensación para Juan Pérez
        INSERT INTO affiliations (
            employee_id,
            tipo,
            proveedor,
            numero_afiliacion_encrypted,
            fecha_afiliacion,
            estado,
            comprobante_s3_key,
            comprobante_filename,
            consentimiento_arco,
            fecha_consentimiento,
            integration_status,
            created_by
        ) VALUES (
            emp_juan_id,
            'CAJA',
            'Compensar',
            encrypt_affiliation_number('1234567890', encryption_key),
            '2024-01-15',
            'activo',
            'affiliations/caja_juan_compensar_2024.pdf',
            'caja_juan_compensar_2024.pdf',
            true,
            '2024-01-15 10:00:00-05',
            'manual',
            admin_user_id
        );
    END IF;
    
    -- Afiliaciones para María García
    IF emp_maria_id IS NOT NULL AND admin_user_id IS NOT NULL THEN
        -- Afiliación ARL para María García
        INSERT INTO affiliations (
            employee_id,
            tipo,
            proveedor,
            numero_afiliacion_encrypted,
            fecha_afiliacion,
            estado,
            comprobante_s3_key,
            comprobante_filename,
            consentimiento_arco,
            fecha_consentimiento,
            integration_status,
            created_by
        ) VALUES (
            emp_maria_id,
            'ARL',
            'Positiva Compañía de Seguros',
            encrypt_affiliation_number('0987654321', encryption_key),
            '2024-02-01',
            'activo',
            'affiliations/arl_maria_positiva_2024.pdf',
            'arl_maria_positiva_2024.pdf',
            true,
            '2024-02-01 09:00:00-05',
            'manual',
            admin_user_id
        );
        
        -- Afiliación EPS para María García
        INSERT INTO affiliations (
            employee_id,
            tipo,
            proveedor,
            numero_afiliacion_encrypted,
            fecha_afiliacion,
            estado,
            comprobante_s3_key,
            comprobante_filename,
            consentimiento_arco,
            fecha_consentimiento,
            integration_status,
            created_by
        ) VALUES (
            emp_maria_id,
            'EPS',
            'Compensar EPS',
            encrypt_affiliation_number('210987654321', encryption_key),
            '2024-02-01',
            'activo',
            'affiliations/eps_maria_compensar_2024.pdf',
            'eps_maria_compensar_2024.pdf',
            true,
            '2024-02-01 09:00:00-05',
            'manual',
            admin_user_id
        );
    END IF;
    
END $$;

-- =====================================================
-- 6. LOGS DE EJEMPLO
-- =====================================================
-- Los logs se crean automáticamente por los triggers al insertar afiliaciones

-- =====================================================
-- FIN DEL SEED
-- =====================================================
