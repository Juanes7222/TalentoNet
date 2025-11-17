import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
  requiredRole?: string;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, hasAllPermissions, hasAnyPermission, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar rol si es requerido
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar permiso único
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar múltiples permisos
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
