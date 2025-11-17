import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../lib/api-client';
import { User, AuthContextType, LoginResponse } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token guardado al cargar
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    const { access_token, refresh_token, user: userData } = response.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    
    // Obtener todos los permisos de todos los roles del usuario
    const userPermissions = user.roles.flatMap(role => 
      role.permissions?.map(p => p.name) || []
    );
    
    return userPermissions.includes(permission);
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (roleName: string): boolean => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    return user.roles.some(role => role.name === roleName);
  };

  // Verificar si tiene al menos uno de los permisos
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    return permissions.some(permission => hasPermission(permission));
  };

  // Verificar si tiene todos los permisos
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    return permissions.every(permission => hasPermission(permission));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
