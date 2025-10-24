import apiClient from '@/lib/api-client';
import type { Employee, EmployeesResponse, EmployeeFormData } from './types';

export const employeesApi = {
  getAll: async (params?: {
    search?: string;
    status?: string;
    city?: string;
    department?: string;
    page?: number;
    limit?: number;
  }): Promise<EmployeesResponse> => {
    const { data } = await apiClient.get('/employees', { params });
    return data;
  },

  getById: async (id: string): Promise<Employee> => {
    const { data } = await apiClient.get(`/employees/${id}`);
    return data;
  },

  create: async (employeeData: EmployeeFormData): Promise<Employee> => {
    const { data } = await apiClient.post('/employees', employeeData);
    return data;
  },

  update: async (id: string, employeeData: Partial<EmployeeFormData>): Promise<Employee> => {
    const { data } = await apiClient.patch(`/employees/${id}`, employeeData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },
};
