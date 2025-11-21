-- Seed: Auth System - Roles, Permissions and User Associations
-- Description: Create default roles, permissions and assign them to existing users
-- Date: 2024-11-17

-- Insert Permissions
INSERT INTO permissions (id, name, description) VALUES
  (gen_random_uuid(), 'users.create', 'Create new users'),
  (gen_random_uuid(), 'users.read', 'View users'),
  (gen_random_uuid(), 'users.update', 'Update user information'),
  (gen_random_uuid(), 'users.delete', 'Delete users'),
  (gen_random_uuid(), 'users.invite', 'Send user invitations'),
  (gen_random_uuid(), 'users.suspend', 'Suspend/activate users'),
  (gen_random_uuid(), 'roles.manage', 'Manage roles and permissions'),
  (gen_random_uuid(), 'employees.create', 'Create employees'),
  (gen_random_uuid(), 'employees.read', 'View employees'),
  (gen_random_uuid(), 'employees.update', 'Update employees'),
  (gen_random_uuid(), 'employees.delete', 'Delete employees'),
  (gen_random_uuid(), 'payroll.create', 'Create payroll'),
  (gen_random_uuid(), 'payroll.read', 'View payroll'),
  (gen_random_uuid(), 'payroll.approve', 'Approve payroll'),
  (gen_random_uuid(), 'payroll.calculate', 'Calculate payroll'),
  (gen_random_uuid(), 'recruitment.create', 'Create job postings and candidates'),
  (gen_random_uuid(), 'recruitment.read', 'View recruitment data'),
  (gen_random_uuid(), 'recruitment.update', 'Update candidates and vacancies'),
  (gen_random_uuid(), 'affiliations.create', 'Create affiliations'),
  (gen_random_uuid(), 'affiliations.read', 'View affiliations'),
  (gen_random_uuid(), 'affiliations.update', 'Update affiliations'),
  (gen_random_uuid(), 'settlements.create', 'Create settlements'),
  (gen_random_uuid(), 'settlements.read', 'View settlements'),
  (gen_random_uuid(), 'settlements.approve', 'Approve settlements'),
  (gen_random_uuid(), 'certifications.create', 'Generate certifications'),
  (gen_random_uuid(), 'certifications.read', 'View certifications'),
  (gen_random_uuid(), 'documents.upload', 'Upload documents'),
  (gen_random_uuid(), 'documents.read', 'View documents'),
  (gen_random_uuid(), 'audit.view', 'View audit logs'),
  (gen_random_uuid(), 'reports.generate', 'Generate reports')
ON CONFLICT (name) DO NOTHING;

-- Insert Roles
INSERT INTO roles (id, name, description) VALUES
  (gen_random_uuid(), 'admin', 'System Administrator - Full access'),
  (gen_random_uuid(), 'rrhh', 'Human Resources - Manage employees and recruitment'),
  (gen_random_uuid(), 'contabilidad', 'Accounting - Manage payroll and finances'),
  (gen_random_uuid(), 'gerencia', 'Management - View reports and approve'),
  (gen_random_uuid(), 'employee', 'Regular Employee - Limited access')
ON CONFLICT (name) DO NOTHING;

-- Assign ALL permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin';

-- Assign permissions to rrhh role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'rrhh'
  AND p.name IN (
    'users.create', 'users.read', 'users.update', 'users.invite',
    'employees.create', 'employees.read', 'employees.update', 'employees.delete',
    'recruitment.create', 'recruitment.read', 'recruitment.update',
    'affiliations.create', 'affiliations.read', 'affiliations.update',
    'certifications.create', 'certifications.read',
    'documents.upload', 'documents.read',
    'reports.generate'
  );

-- Assign permissions to contabilidad role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'contabilidad'
  AND p.name IN (
    'employees.read',
    'payroll.create', 'payroll.read', 'payroll.calculate', 'payroll.approve',
    'settlements.create', 'settlements.read', 'settlements.approve',
    'affiliations.read',
    'reports.generate'
  );

-- Assign permissions to gerencia role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'gerencia'
  AND p.name IN (
    'users.read',
    'employees.read',
    'payroll.read', 'payroll.approve',
    'recruitment.read',
    'affiliations.read',
    'settlements.read', 'settlements.approve',
    'certifications.read',
    'audit.view',
    'reports.generate'
  );

-- Assign basic permissions to employee role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'employee'
  AND p.name IN (
    'certifications.create',
    'certifications.read',
    'documents.read'
  );

-- Assign roles to existing users based on their email patterns
-- Admin users
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.email LIKE '%admin%'
  AND r.name = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- RRHH users
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE (u.email LIKE '%rh%' OR u.email LIKE '%rrhh%' OR u.email LIKE '%hr%')
  AND r.name = 'rrhh'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Contabilidad users
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE (u.email LIKE '%contabilidad%' OR u.email LIKE '%accounting%' OR u.email LIKE '%contador%')
  AND r.name = 'contabilidad'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Gerencia users
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE (u.email LIKE '%gerente%' OR u.email LIKE '%manager%' OR u.email LIKE '%director%')
  AND r.name = 'gerencia'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Assign employee role to all users without any role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE r.name = 'employee'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id
  );

-- Update user status to ACTIVE for users with roles
UPDATE users
SET status = 'ACTIVE'
WHERE status = 'INVITED'
  AND id IN (SELECT DISTINCT user_id FROM user_roles);

-- Log summary
DO $$
DECLARE
  total_permissions INTEGER;
  total_roles INTEGER;
  total_user_roles INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_permissions FROM permissions;
  SELECT COUNT(*) INTO total_roles FROM roles;
  SELECT COUNT(*) INTO total_user_roles FROM user_roles;
  
  RAISE NOTICE 'Auth System Seed Completed:';
  RAISE NOTICE '  - Permissions: %', total_permissions;
  RAISE NOTICE '  - Roles: %', total_roles;
  RAISE NOTICE '  - User-Role Assignments: %', total_user_roles;
END $$;
