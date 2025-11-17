import { useAuth } from '../contexts/AuthContext';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = useAuth();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    // Si no se especifica ningún permiso, mostrar por defecto
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
