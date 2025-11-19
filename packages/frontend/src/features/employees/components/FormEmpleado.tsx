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
        alert(`Conflicto: ${errorMessage}`);
      } else if (error?.response?.status === 400) {
        alert(`Datos inválidos: ${errorMessage}`);
      } else {
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-slate-700 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          Información Personal
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipo de Identificación *
            </label>
            <select 
              {...register('identificationType')} 
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="">Seleccione...</option>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="PAS">Pasaporte</option>
            </select>
            {errors.identificationType && (
              <p className="mt-2 text-sm text-red-400">{errors.identificationType.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Número de Identificación *
            </label>
            <input 
              type="text" 
              {...register('identificationNumber')} 
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="1234567890"
            />
            {errors.identificationNumber && (
              <p className="mt-2 text-sm text-red-400">{errors.identificationNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nombres *</label>
            <input 
              type="text" 
              {...register('firstName')} 
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Juan"
            />
            {errors.firstName && (
              <p className="mt-2 text-sm text-red-400">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Apellidos *</label>
            <input 
              type="text" 
              {...register('lastName')} 
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Pérez García"
            />
            {errors.lastName && (
              <p className="mt-2 text-sm text-red-400">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Fecha de Nacimiento *
            </label>
            <input 
              type="date" 
              {...register('dateOfBirth')} 
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
            {errors.dateOfBirth && (
              <p className="mt-2 text-sm text-red-400">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Género</label>
            <select 
              {...register('gender')} 
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="">Seleccione...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Teléfono</label>
            <input 
              type="tel" 
              {...register('phone')} 
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="+57 3001234567"
            />
            {errors.phone && (
              <p className="mt-2 text-sm text-red-400">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input 
              type="email" 
              {...register('email')} 
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="juan.perez@email.com"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">Dirección</label>
            <input 
              type="text" 
              {...register('address')} 
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Calle 123 #45-67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Ciudad</label>
            <input 
              type="text" 
              {...register('city')} 
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Bogotá"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Departamento</label>
            <input 
              type="text" 
              {...register('department')} 
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Cundinamarca"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Fecha de Contratación *
            </label>
            <input 
              type="date" 
              {...register('hireDate')} 
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
            {errors.hireDate && (
              <p className="mt-2 text-sm text-red-400">{errors.hireDate.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Sección de Contrato (solo al crear) */}
      {!isEditing && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-slate-700 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Información del Contrato
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tipo de Contrato *
              </label>
              <select 
                {...register('contract.contractType')} 
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">Seleccione...</option>
                <option value="indefinido">Indefinido</option>
                <option value="fijo">Fijo</option>
                <option value="obra_labor">Obra o Labor</option>
                <option value="prestacion_servicios">Prestación de Servicios</option>
              </select>
              {!isEditing && (errors as any).contract?.contractType && (
                <p className="mt-2 text-sm text-red-400">{(errors as any).contract.contractType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cargo *</label>
              <input 
                type="text" 
                {...register('contract.position')} 
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Ej: Desarrollador Senior"
              />
              {!isEditing && (errors as any).contract?.position && (
                <p className="mt-2 text-sm text-red-400">{(errors as any).contract.position.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Departamento *</label>
              <input 
                type="text" 
                {...register('contract.department')} 
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Ej: Tecnología"
              />
              {!isEditing && (errors as any).contract?.department && (
                <p className="mt-2 text-sm text-red-400">{(errors as any).contract.department.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Salario *</label>
              <input 
                type="number" 
                {...register('contract.salary', { valueAsNumber: true })} 
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                step="1000"
                min="0"
                placeholder="0"
              />
              {!isEditing && (errors as any).contract?.salary && (
                <p className="mt-2 text-sm text-red-400">{(errors as any).contract.salary.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Fecha de Inicio del Contrato *
              </label>
              <input 
                type="date" 
                {...register('contract.startDate')} 
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
              {!isEditing && (errors as any).contract?.startDate && (
                <p className="mt-2 text-sm text-red-400">{(errors as any).contract.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Fecha de Fin (solo contratos fijos)
              </label>
              <input 
                type="date" 
                {...register('contract.endDate')} 
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
              {!isEditing && (errors as any).contract?.endDate && (
                <p className="mt-2 text-sm text-red-400">{(errors as any).contract.endDate.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/employees')}
          className="px-6 py-3 inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="px-6 py-3 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4m8-8h-4M4 12H8"/></svg>
              Guardando...
            </>
          ) : isEditing ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21q-1.875 0-3.512-.712t-2.85-1.925t-1.925-2.85T3 12t.713-3.512t1.924-2.85t2.85-1.925T12 3q2.05 0 3.888.875T19 6.35V4h2v6h-6V8h2.75q-1.025-1.4-2.525-2.2T12 5Q9.075 5 7.038 7.038T5 12t2.038 4.963T12 19q2.625 0 4.588-1.7T18.9 13h2.05q-.375 3.425-2.937 5.713T12 21m2.8-4.8L11 12.4V7h2v4.6l3.2 3.2z"/></svg>
              Actualizar
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Crear Empleado
            </>
          )}
        </button>
      </div>
    </form>
  );
}