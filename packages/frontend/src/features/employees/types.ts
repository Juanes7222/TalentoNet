import { z } from 'zod';

export const employeeSchema = z.object({
  identificationType: z.enum(['CC', 'CE', 'TI', 'PAS'], {
    required_error: 'Tipo de identificación es requerido',
  }),
  identificationNumber: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  firstName: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  lastName: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)'),
  gender: z.enum(['M', 'F', 'Otro']).optional(),
  phone: z
    .string()
    .regex(/^[0-9]{7,20}$/, 'Teléfono debe contener 7-20 dígitos')
    .optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  department: z.string().optional(),
  country: z.string().optional(),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)'),
  email: z.string().email('Email inválido').optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

export interface Employee {
  id: string;
  identificationType: string;
  identificationNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: string;
  country: string;
  hireDate: string;
  terminationDate?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeesResponse {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
}
