-- Migration: Auth System Setup
-- Description: Add comprehensive authentication and authorization system with RBAC, MFA, audit logs, and token management
-- Date: 2024-11-17

-- Create permissions table
CREATE TABLE IF NOT EXISTS "permissions" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" character varying NOT NULL,
  "description" text,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_permissions_name" UNIQUE ("name"),
  CONSTRAINT "PK_permissions" PRIMARY KEY ("id")
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS "role_permissions" (
  "role_id" uuid NOT NULL,
  "permission_id" uuid NOT NULL,
  CONSTRAINT "PK_role_permissions" PRIMARY KEY ("role_id", "permission_id")
);

CREATE INDEX IF NOT EXISTS "IDX_role_permissions_role_id" ON "role_permissions" ("role_id");
CREATE INDEX IF NOT EXISTS "IDX_role_permissions_permission_id" ON "role_permissions" ("permission_id");

ALTER TABLE "role_permissions" 
  ADD CONSTRAINT "FK_role_permissions_role" 
  FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions" 
  ADD CONSTRAINT "FK_role_permissions_permission" 
  FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Modify users table - backup existing role relationships if needed
-- Note: Existing users will need their roles migrated to the new user_roles table

-- Drop old single-role relationship
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_role";
ALTER TABLE "users" DROP COLUMN IF EXISTS "role_id";
ALTER TABLE "users" DROP COLUMN IF EXISTS "is_active";

-- Add new columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "full_name" character varying;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" character varying(20) NOT NULL DEFAULT 'INVITED';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "employee_id" uuid;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mfa_enabled" boolean NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mfa_secret_encrypted" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "created_by" uuid;

-- Make password_hash nullable for SSO-only users
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;

-- Add foreign keys to users
ALTER TABLE "users" 
  ADD CONSTRAINT "FK_users_employee" 
  FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL;

ALTER TABLE "users" 
  ADD CONSTRAINT "FK_users_created_by" 
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL;

-- Create user_roles junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS "user_roles" (
  "user_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  CONSTRAINT "PK_user_roles" PRIMARY KEY ("user_id", "role_id")
);

CREATE INDEX IF NOT EXISTS "IDX_user_roles_user_id" ON "user_roles" ("user_id");
CREATE INDEX IF NOT EXISTS "IDX_user_roles_role_id" ON "user_roles" ("role_id");

ALTER TABLE "user_roles" 
  ADD CONSTRAINT "FK_user_roles_user" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_roles" 
  ADD CONSTRAINT "FK_user_roles_role" 
  FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "user_id" uuid NOT NULL,
  "refresh_token_hash" character varying NOT NULL,
  "issued_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "revoked" boolean NOT NULL DEFAULT false,
  "revoked_at" TIMESTAMP WITH TIME ZONE,
  "ip_address" character varying,
  "user_agent" text,
  CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_refresh_tokens_user_revoked" 
  ON "refresh_tokens" ("user_id", "revoked");

ALTER TABLE "refresh_tokens" 
  ADD CONSTRAINT "FK_refresh_tokens_user" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Create invitations table
CREATE TABLE IF NOT EXISTS "invitations" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "email" character varying NOT NULL,
  "token_hash" character varying NOT NULL,
  "type" character varying(20) NOT NULL DEFAULT 'USER_INVITE',
  "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "created_by" uuid,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "used_by" uuid,
  "used_at" TIMESTAMP WITH TIME ZONE,
  CONSTRAINT "PK_invitations" PRIMARY KEY ("id")
);

ALTER TABLE "invitations" 
  ADD CONSTRAINT "FK_invitations_created_by" 
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL;

ALTER TABLE "invitations" 
  ADD CONSTRAINT "FK_invitations_used_by" 
  FOREIGN KEY ("used_by") REFERENCES "users"("id") ON DELETE SET NULL;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "actor_user_id" uuid,
  "action" character varying(50) NOT NULL,
  "resource_type" character varying,
  "resource_id" character varying,
  "ip_address" character varying,
  "user_agent" text,
  "details" jsonb,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_audit_logs_actor_action_created" 
  ON "audit_logs" ("actor_user_id", "action", "created_at");

CREATE INDEX IF NOT EXISTS "IDX_audit_logs_resource" 
  ON "audit_logs" ("resource_type", "resource_id");

ALTER TABLE "audit_logs" 
  ADD CONSTRAINT "FK_audit_logs_actor" 
  FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL;

-- Comments for documentation
COMMENT ON TABLE "permissions" IS 'System permissions for fine-grained access control';
COMMENT ON TABLE "role_permissions" IS 'Many-to-many relationship between roles and permissions';
COMMENT ON TABLE "user_roles" IS 'Many-to-many relationship between users and roles - replaces single role_id';
COMMENT ON TABLE "refresh_tokens" IS 'Persistent refresh tokens with revocation support';
COMMENT ON TABLE "invitations" IS 'User invitations and password reset tokens';
COMMENT ON TABLE "audit_logs" IS 'Complete audit trail for security and compliance';
COMMENT ON COLUMN "users"."status" IS 'User account status: INVITED, ACTIVE, SUSPENDED, INACTIVE';
COMMENT ON COLUMN "users"."mfa_enabled" IS 'Whether multi-factor authentication is enabled';
COMMENT ON COLUMN "users"."mfa_secret_encrypted" IS 'Encrypted TOTP secret for MFA';
