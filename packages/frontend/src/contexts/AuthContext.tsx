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
    const refreshToken = localStorage.getItem('refresh_token');
    
    console.log('🔐 AuthContext: Inicializando...', { 
      hasToken: !!token, 
      hasRefreshToken: !!refreshToken,
      token: token?.substring(0, 20) + '...',
    });
    
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
      console.error('❌ Error al obtener usuario:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    
    const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    const { access_token, refresh_token, user: userData } = response.data;
    
    console.log('✅ Login exitoso:', { 
      user: userData.email,
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token 
    });
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    setUser(userData);
  };

  const logout = () => {
    console.log('🚪 Cerrando sesión. Tokens actuales:', {
      access: localStorage.getItem('access_token')?.substring(0, 20),
      refresh: localStorage.getItem('refresh_token')?.substring(0, 20),
    });
    
    // Limpiar localStorage primero
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    console.log('✅ Tokens eliminados. Verificando:', {
      access: localStorage.getItem('access_token'),
      refresh: localStorage.getItem('refresh_token'),
    });
    
    // Limpiar estado
    setUser(null);
    
    // Redirigir al login después de limpiar todo
    window.location.href = '/login';
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
