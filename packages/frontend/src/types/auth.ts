export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_INVITATION = 'PENDING_INVITATION',
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  employeeId: string | null;
  status: UserStatus;
  mfaEnabled: boolean;
  roles: Role[];
  permissions?: Permission[];
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}
