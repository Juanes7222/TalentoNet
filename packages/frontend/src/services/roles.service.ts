import apiClient from '../lib/api-client';
import { Role, Permission } from '../types/auth';

export interface CreateRoleDto {
  name: string;
  description: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

class RolesService {
  private readonly basePath = '/api/roles';

  async findAll(): Promise<Role[]> {
    const response = await apiClient.get<Role[]>(this.basePath);
    return response.data;
  }

  async findById(id: string): Promise<Role> {
    const response = await apiClient.get<Role>(`${this.basePath}/${id}`);
    return response.data;
  }

  async create(data: CreateRoleDto): Promise<Role> {
    const response = await apiClient.post<Role>(this.basePath, data);
    return response.data;
  }

  async update(id: string, data: UpdateRoleDto): Promise<Role> {
    const response = await apiClient.patch<Role>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  async getRolePermissions(id: string): Promise<Permission[]> {
    const response = await apiClient.get<Permission[]>(`${this.basePath}/${id}/permissions`);
    return response.data;
  }

  async assignPermissions(id: string, permissionIds: string[]): Promise<Role> {
    const response = await apiClient.post<Role>(`${this.basePath}/${id}/permissions`, { permissionIds });
    return response.data;
  }

  async revokePermission(id: string, permissionId: string): Promise<Role> {
    const response = await apiClient.delete<Role>(`${this.basePath}/${id}/permissions/${permissionId}`);
    return response.data;
  }
}

export default new RolesService();
