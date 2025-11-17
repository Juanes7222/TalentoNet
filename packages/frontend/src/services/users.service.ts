import apiClient from '../lib/api-client';
import { User, UserStatus } from '../types/auth';

export interface CreateUserDto {
  email: string;
  fullName?: string;
  identificationNumber?: string;
  employeeId?: string;
  roleIds: string[];
  sendInvitation?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  employeeId?: string;
  roleIds?: string[];
}

export interface UserFilters {
  email?: string;
  status?: UserStatus;
  roleId?: string;
  employeeId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

class UsersService {
  private readonly basePath = '/api/users';

  async findAll(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    
    if (filters?.email) params.append('email', filters.email);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.roleId) params.append('roleId', filters.roleId);
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<PaginatedResponse<User>>(
      `${this.basePath}?${params.toString()}`
    );
    return response.data;
  }

  async findById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`${this.basePath}/${id}`);
    return response.data;
  }

  async create(data: CreateUserDto): Promise<User> {
    const response = await apiClient.post<User>(this.basePath, data);
    return response.data;
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await apiClient.patch<User>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  async sendInvitation(id: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${id}/invite`);
  }

  async assignRoles(id: string, roleIds: string[]): Promise<User> {
    const response = await apiClient.post<User>(`${this.basePath}/${id}/roles`, { roleIds });
    return response.data;
  }

  async revokeRole(id: string, roleId: string): Promise<User> {
    const response = await apiClient.delete<User>(`${this.basePath}/${id}/roles/${roleId}`);
    return response.data;
  }

  async suspend(id: string, reason?: string): Promise<User> {
    const response = await apiClient.patch<User>(`${this.basePath}/${id}/suspend`, { reason });
    return response.data;
  }

  async activate(id: string): Promise<User> {
    const response = await apiClient.patch<User>(`${this.basePath}/${id}/activate`);
    return response.data;
  }

  async changePassword(id: string, data: ChangePasswordDto): Promise<void> {
    await apiClient.post(`${this.basePath}/${id}/change-password`, data);
  }
}

export default new UsersService();
