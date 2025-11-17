import { useAuth } from '../contexts/AuthContext';

interface RoleGateProps {
  children: React.ReactNode;
  role: string;
  fallback?: React.ReactNode;
}

export function RoleGate({ children, role, fallback = null }: RoleGateProps) {
  const { hasRole } = useAuth();

  return hasRole(role) ? <>{children}</> : <>{fallback}</>;
}
