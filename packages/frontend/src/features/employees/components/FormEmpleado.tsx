import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { employeeSchema, employeeUpdateSchema, type EmployeeFormData, type EmployeeUpdateFormData } from '../types';
import { useCreateEmployee, useUpdateEmployee } from '../hooks';

interface FormEmpleadoProps {
  employeeId?: string;
  initialData?: Partial<EmployeeFormData> | Partial<EmployeeUpdateFormData>;
}

export default function FormEmpleado({ employeeId, initialData }: FormEmpleadoProps) {
  const navigate = useNavigate();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const isEditing = !!employeeId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData | EmployeeUpdateFormData>({
    resolver: zodResolver(isEditing ? employeeUpdateSchema : employeeSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: EmployeeFormData | EmployeeUpdateFormData) => {
    try {
      // Limpiar datos antes de enviar
      const cleanData = { ...data };
      
      // Si es creación y tiene contrato
      if (!isEditing && 'contract' in cleanData && cleanData.contract) {
        // Si endDate está vacío, eliminarlo del objeto
        if (!cleanData.contract.endDate || cleanData.contract.endDate === '') {
          delete cleanData.contract.endDate;
        }
      }
      
      if (isEditing) {
        await updateEmployee.mutateAsync({ id: employeeId, data: cleanData as EmployeeUpdateFormData });
        alert('Empleado actualizado exitosamente');
      } else {
        await createEmployee.mutateAsync(cleanData as EmployeeFormData);
        alert('Empleado creado exitosamente');
      }
      navigate('/employees');
    } catch (error: any) {
      // Extraer el mensaje de error del backend
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      
      // Mostrar mensaje más amigable para errores de conflicto
      if (error?.response?.status === 409) {
        alert(`❌ Conflicto: ${errorMessage}`);
      } else if (error?.response?.status === 400) {
        alert(`❌ Datos inválidos: ${errorMessage}`);
      } else {
        alert(`❌ Error: ${errorMessage}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Identificación *
            </label>
            <select {...register('identificationType')} className="input">
              <option value="">Seleccione...</option>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="PAS">Pasaporte</option>
            </select>
            {errors.identificationType && (
              <p className="mt-1 text-sm text-red-600">{errors.identificationType.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Identificación *
            </label>
            <input type="text" {...register('identificationNumber')} className="input" />
            {errors.identificationNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.identificationNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
            <input type="text" {...register('firstName')} className="input" />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
            <input type="text" {...register('lastName')} className="input" />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento *
            </label>
            <input type="date" {...register('dateOfBirth')} className="input" />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
            <select {...register('gender')} className="input">
              <option value="">Seleccione...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input type="tel" {...register('phone')} className="input" />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" {...register('email')} className="input" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input type="text" {...register('address')} className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <input type="text" {...register('city')} className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
            <input type="text" {...register('department')} className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Contratación *
            </label>
            <input type="date" {...register('hireDate')} className="input" />
            {errors.hireDate && (
              <p className="mt-1 text-sm text-red-600">{errors.hireDate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Sección de Contrato (solo al crear) */}
      {!isEditing && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Información del Contrato</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Contrato *
              </label>
              <select {...register('contract.contractType')} className="input">
                <option value="">Seleccione...</option>
                <option value="indefinido">Indefinido</option>
                <option value="fijo">Fijo</option>
                <option value="obra_labor">Obra o Labor</option>
                <option value="prestacion_servicios">Prestación de Servicios</option>
              </select>
              {!isEditing && (errors as any).contract?.contractType && (
                <p className="mt-1 text-sm text-red-600">{(errors as any).contract.contractType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
              <input type="text" {...register('contract.position')} className="input" />
              {!isEditing && (errors as any).contract?.position && (
                <p className="mt-1 text-sm text-red-600">{(errors as any).contract.position.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
              <input type="text" {...register('contract.department')} className="input" />
              {!isEditing && (errors as any).contract?.department && (
                <p className="mt-1 text-sm text-red-600">{(errors as any).contract.department.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salario *</label>
              <input 
                type="number" 
                {...register('contract.salary', { valueAsNumber: true })} 
                className="input"
                step="1000"
                min="0"
              />
              {!isEditing && (errors as any).contract?.salary && (
                <p className="mt-1 text-sm text-red-600">{(errors as any).contract.salary.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio del Contrato *
              </label>
              <input type="date" {...register('contract.startDate')} className="input" />
              {!isEditing && (errors as any).contract?.startDate && (
                <p className="mt-1 text-sm text-red-600">{(errors as any).contract.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin (solo contratos fijos)
              </label>
              <input type="date" {...register('contract.endDate')} className="input" />
              {!isEditing && (errors as any).contract?.endDate && (
                <p className="mt-1 text-sm text-red-600">{(errors as any).contract.endDate.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/employees')}
          className="btn btn-secondary"
        >
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Empleado'}
        </button>
      </div>
    </form>
  );
}
