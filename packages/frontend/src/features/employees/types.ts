import { z } from 'zod';

// Schema para información del contrato
export const contractSchema = z.object({
  contractType: z.enum(['indefinido', 'fijo', 'obra_labor', 'prestacion_servicios'], {
    required_error: 'Tipo de contrato es requerido',
  }),
  position: z.string().min(2, 'Cargo debe tener mínimo 2 caracteres'),
  department: z.string().min(2, 'Departamento debe tener mínimo 2 caracteres'),
  salary: z.number().min(0, 'Salario debe ser mayor a 0'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)')
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // Si no hay endDate o está vacío, es válido
    if (!data.endDate || data.endDate === '') return true;
    
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    return endDate > startDate;
  },
  {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endDate'],
  }
);

// Schema base para empleado
const employeeBaseSchema = z.object({
  identificationType: z.enum(['CC', 'CE', 'TI', 'PAS'], {
    required_error: 'Tipo de identificación es requerido',
  }),
  identificationNumber: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  firstName: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  lastName: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (YYYY-MM-DD)')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      return birthDate <= eighteenYearsAgo;
    }, 'El empleado debe tener al menos 18 años'),
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

// Schema para crear empleado (requiere contrato)
export const employeeSchema = employeeBaseSchema.extend({
  contract: contractSchema,
});

// Schema para editar empleado (sin contrato)
export const employeeUpdateSchema = employeeBaseSchema;

export type ContractFormData = z.infer<typeof contractSchema>;
export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type EmployeeUpdateFormData = z.infer<typeof employeeUpdateSchema>;

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
