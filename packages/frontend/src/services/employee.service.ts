import apiClient from '../lib/api-client';

export interface Employee {
  id: string;
  identificationType?: string;
  identificationNumber: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: string;
  country?: string;
  hireDate?: string;
  terminationDate?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt?: string;
  updatedAt?: string;
  // Campos legacy (mantener por compatibilidad)
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
  civilStatus?: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodType?: string;
  eps?: string;
  afp?: string;
  arl?: string;
}

export const getEmployees = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<Employee[]> => {
  const response = await apiClient.get('/employees', { params });
  // Si la respuesta tiene estructura paginada, extraer el array de data
  return response.data.data || response.data;
};

export const getEmployee = async (id: string): Promise<Employee> => {
  const response = await apiClient.get(`/employees/${id}`);
  return response.data;
};
