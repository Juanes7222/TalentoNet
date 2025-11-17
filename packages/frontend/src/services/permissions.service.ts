import apiClient from '../lib/api-client';
import { Permission } from '../types/auth';

export interface CreatePermissionDto {
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface UpdatePermissionDto {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
}

class PermissionsService {
  private readonly basePath = '/api/permissions';

  async findAll(): Promise<Permission[]> {
    const response = await apiClient.get<Permission[]>(this.basePath);
    return response.data;
  }

  async findById(id: string): Promise<Permission> {
    const response = await apiClient.get<Permission>(`${this.basePath}/${id}`);
    return response.data;
  }

  async create(data: CreatePermissionDto): Promise<Permission> {
    const response = await apiClient.post<Permission>(this.basePath, data);
    return response.data;
  }

  async update(id: string, data: UpdatePermissionDto): Promise<Permission> {
    const response = await apiClient.patch<Permission>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}

export default new PermissionsService();
