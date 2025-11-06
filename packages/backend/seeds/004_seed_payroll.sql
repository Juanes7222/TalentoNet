-- =====================================================
-- Seed 004: Datos de prueba para Módulo de Nómina
-- =====================================================
-- Inserta un período de nómina con novedades y liquidación de prueba

-- Verificar que existan empleados
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM employees LIMIT 1) THEN
    RAISE EXCEPTION 'No hay empleados en la base de datos. Ejecutar seed 001 primero.';
  END IF;
END $$;

-- =====================================================
-- 1. Crear período de nómina de prueba
-- =====================================================

INSERT INTO payroll_period (id, tipo, fecha_inicio, fecha_fin, estado, descripcion, created_by)
VALUES 
  (1, 'quincenal', '2024-11-01', '2024-11-15', 'abierto', 'Quincena noviembre 2024 - Primera quincena', 1);

-- Actualizar secuencia
SELECT setval('payroll_period_id_seq', (SELECT MAX(id) FROM payroll_period));

-- =====================================================
-- 2. Agregar novedades de ejemplo
-- =====================================================

-- Obtener IDs de empleados de prueba
DO $$
DECLARE
  emp_id_1 VARCHAR(36);
  emp_id_2 VARCHAR(36);
  emp_id_3 VARCHAR(36);
BEGIN
  -- Obtener primeros 3 empleados
  SELECT id INTO emp_id_1 FROM employees ORDER BY created_at LIMIT 1 OFFSET 0;
  SELECT id INTO emp_id_2 FROM employees ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO emp_id_3 FROM employees ORDER BY created_at LIMIT 1 OFFSET 2;

  -- Novedades para empleado 1: Horas extras
  INSERT INTO payroll_novedad (employee_id, payroll_period_id, tipo, categoria, valor, cantidad, fecha, comentario, created_by)
  VALUES 
    (emp_id_1, 1, 'horas_extras_diurnas', 'devengo', 15625, 10, '2024-11-10', 'Proyecto de implementación urgente', 1),
    (emp_id_1, 1, 'bono_productividad', 'devengo', 200000, 1, '2024-11-12', 'Bono por cumplimiento de metas', 1);

  -- Novedades para empleado 2: Comisiones y préstamo
  INSERT INTO payroll_novedad (employee_id, payroll_period_id, tipo, categoria, valor, cantidad, fecha, comentario, created_by)
  VALUES 
    (emp_id_2, 1, 'comision_ventas', 'devengo', 500000, 1, '2024-11-08', 'Comisión ventas mes anterior', 1),
    (emp_id_2, 1, 'prestamo_empresa', 'deduccion', 100000, 1, '2024-11-01', 'Cuota préstamo 1/5', 1);

  -- Novedades para empleado 3: Horas dominicales
  INSERT INTO payroll_novedad (employee_id, payroll_period_id, tipo, categoria, valor, cantidad, fecha, comentario, created_by)
  VALUES 
    (emp_id_3, 1, 'horas_dominicales', 'devengo', 27343, 8, '2024-11-03', 'Trabajo dominical por entrega', 1);

END $$;

-- =====================================================
-- 3. Comentarios y documentación
-- =====================================================

COMMENT ON TABLE payroll_period IS 'Períodos de nómina (quincenal/mensual) con ciclo de estados: abierto → liquidado → aprobado → cerrado';
COMMENT ON TABLE payroll_novedad IS 'Novedades que afectan la liquidación: horas extras, bonos, comisiones, préstamos, embargos, etc.';
COMMENT ON TABLE payroll_entry IS 'Liquidación calculada por empleado y período con breakdown de devengos y deducciones';

-- =====================================================
-- Verificación
-- =====================================================

SELECT 
  'Período creado:' as status,
  id,
  tipo,
  fecha_inicio,
  fecha_fin,
  estado,
  descripcion
FROM payroll_period
WHERE id = 1;

SELECT 
  'Novedades agregadas:' as status,
  COUNT(*) as total,
  categoria,
  SUM(valor * cantidad) as total_valor
FROM payroll_novedad
WHERE payroll_period_id = 1
GROUP BY categoria;

-- =====================================================
-- Instrucciones de uso
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'SEED DE NÓMINA COMPLETADO';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Período creado: ID=1, Quincenal 01-15 Nov 2024';
  RAISE NOTICE 'Estado: abierto (listo para liquidar)';
  RAISE NOTICE '';
  RAISE NOTICE 'Siguiente paso:';
  RAISE NOTICE 'POST /api/payroll/periods/1/liquidate';
  RAISE NOTICE '{ } (liquida todos los empleados activos)';
  RAISE NOTICE '';
  RAISE NOTICE 'Ver novedades:';
  RAISE NOTICE 'GET /api/payroll/periods/1/novedades';
  RAISE NOTICE '';
  RAISE NOTICE 'Ver documentación completa en:';
  RAISE NOTICE 'docs/PAYROLL-MODULE.md';
  RAISE NOTICE '============================================';
END $$;
