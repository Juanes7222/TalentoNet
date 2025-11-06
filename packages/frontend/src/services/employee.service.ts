import apiClient from '../lib/api-client';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  gender: string;
  civilStatus: string;
  address: string;
  phone: string;
  email: string;
  department: string;
  city: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodType: string;
  eps: string;
  afp: string;
  arl: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await apiClient.get('/employees');
  return response.data;
};

export const getEmployee = async (id: string): Promise<Employee> => {
  const response = await apiClient.get(`/employees/${id}`);
  return response.data;
};
