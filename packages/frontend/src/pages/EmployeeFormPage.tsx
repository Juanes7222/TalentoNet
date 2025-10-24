import { useParams } from 'react-router-dom';
import FormEmpleado from '../features/employees/components/FormEmpleado';

export function EmployeeFormPage() {
  const { id } = useParams();

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
          {id ? 'Editar Empleado' : 'Nuevo Empleado'}
        </h2>
        <FormEmpleado employeeId={id} />
      </div>
    </div>
  );
}
