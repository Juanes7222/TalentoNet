-- Migración 009: Crear contratos para empleados existentes
-- Esto crea contratos para todos los empleados que tienen hire_date pero no tienen contratos

INSERT INTO contracts (employee_id, contract_type, position, department, salary, start_date, end_date, is_current)
SELECT 
    e.id as employee_id,
    CASE 
        WHEN e.termination_date IS NOT NULL THEN 'fijo'
        ELSE 'indefinido'
    END as contract_type,
    COALESCE(e.department, 'General') as position,
    e.department,
    1300000.00 as salary, -- SMMLV 2024
    e.hire_date as start_date,
    e.termination_date as end_date,
    CASE 
        WHEN e.status = 'active' AND e.termination_date IS NULL THEN true
        ELSE false
    END as is_current
FROM employees e
WHERE e.hire_date IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM contracts c WHERE c.employee_id = e.id
);

COMMENT ON TABLE contracts IS 'Contratos laborales de empleados creados automáticamente desde información de empleados';
