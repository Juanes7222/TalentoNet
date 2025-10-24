import { useParams } from 'react-router-dom';
import { useEmployee } from '../features/employees/hooks';
import FormEmpleado from '../features/employees/components/FormEmpleado';
import type { EmployeeFormData } from '../features/employees/types';

export function EmployeeFormPage() {
  const { id } = useParams();
  const { data: employee, isLoading } = useEmployee(id || '');

  if (id && isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Mapear employee a initialData
  const initialData: Partial<EmployeeFormData> | undefined = employee
    ? {
        identificationType: employee.identificationType as 'CC' | 'CE' | 'TI' | 'PAS',
        identificationNumber: employee.identificationNumber,
        firstName: employee.firstName,
        lastName: employee.lastName,
        dateOfBirth: employee.dateOfBirth,
        hireDate: employee.hireDate,
        gender: employee.gender as 'M' | 'F' | 'Otro' | undefined,
        phone: employee.phone,
        address: employee.address,
        city: employee.city,
        department: employee.department,
      }
    : undefined;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
          {id ? 'Editar Empleado' : 'Nuevo Empleado'}
        </h2>
        <FormEmpleado employeeId={id} initialData={initialData} />
      </div>
    </div>
  );
}
