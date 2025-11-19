import { useParams } from 'react-router-dom';
import { useEmployee } from '../features/employees/hooks';
import FormEmpleado from '../features/employees/components/FormEmpleado';
import type { EmployeeFormData } from '../features/employees/types';

export function EmployeeFormPage() {
  const { id } = useParams();
  const { data: employee, isLoading } = useEmployee(id || '');

  if (id && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl p-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            {id ? (
              <span className="inline-flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 21v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM17.6 7.8L19 6.4L17.6 5l-1.4 1.4z"/></svg>Editar Empleado</span>
            ) : (
              <span className="inline-flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>Nuevo Empleado</span>
            )}
          </h2>
          <p className="text-slate-400 mb-8">
            {id ? 'Actualiza la información del empleado' : 'Completa el formulario para registrar un nuevo empleado'}
          </p>
          <FormEmpleado employeeId={id} initialData={initialData} />
        </div>
      </div>
    </div>
  );
}
