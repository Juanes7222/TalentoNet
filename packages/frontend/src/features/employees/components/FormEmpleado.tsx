import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { employeeSchema, employeeUpdateSchema, type EmployeeFormData, type EmployeeUpdateFormData } from '../types';
import { useCreateEmployee, useUpdateEmployee } from '../hooks';

interface FormEmpleadoProps {
  employeeId?: string;
  onShowNotification?: (type: 'success' | 'error', title: string, message: string) => void;
  initialData?: Partial<EmployeeFormData> | Partial<EmployeeUpdateFormData>;
}

export default function FormEmpleado({ 
  employeeId, 
  initialData, 
  onShowNotification 
}: FormEmpleadoProps) {
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

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    onShowNotification?.(type, title, message);
  };

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
        await updateEmployee.mutateAsync({ id: employeeId!, data: cleanData as EmployeeUpdateFormData });
        showNotification('success', '¡Éxito!', 'Empleado actualizado exitosamente');
      } else {
        await createEmployee.mutateAsync(cleanData as EmployeeFormData);
        showNotification('success', '¡Éxito!', 'Empleado creado exitosamente');
      }

      setTimeout(() => {
        navigate('/employees');
      }, 1500);
    } catch (error: any) {
      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.message || '';

      if (status === 409) {
        if (serverMessage.includes('identificación') || serverMessage.includes('cédula')) {
          showNotification('error', 'Cédula duplicada', 
            'Ya existe un empleado con este número de identificación');
        } 
        else if (serverMessage.includes('usuario') || serverMessage.includes('email') || serverMessage.includes('correo')) {
          showNotification('error', 'Email duplicado', 
            'El correo electrónico ya está registrado en el sistema');
        }
        else {
          showNotification('error', 'Datos duplicados', serverMessage);
        }
      }
      else if (status >= 500) {
        showNotification('error', 'Error del servidor', 
          'Ocurrió un error interno. Intenta de nuevo más tarde.');
      }
      else {
        const msg = serverMessage || 'Error desconocido al guardar el empleado';
        showNotification('error', 'Error', msg);
      }
    }
  };

  const handleCancel = () => {
    if (window.confirm('¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.')) {
      navigate('/employees');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Título del formulario */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Información Personal
        </h2>
      </div>

      {/* Grid de campos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de Identificación */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tipo de Identificación *
              </label>
              <select 
                {...register('identificationType')}
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  errors.identificationType ? 'border-red-500/50 ring-2 ring-red-500/50' : 'border-slate-600/50'
                }`}
              >
                <option value="">Seleccione...</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="PAS">Pasaporte</option>
              </select>
              {errors.identificationType && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.identificationType.message}</span>
                </p>
              )}
            </div>

            {/* Número de Identificación */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Número de Identificación *
              </label>
              <input 
                type="text"
                {...register('identificationNumber')}
                placeholder="Ingresa el número"
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  errors.identificationNumber ? 'border-red-500/50 ring-2 ring-red-500/50' : 'border-slate-600/50'
                }`}
              />
              {errors.identificationNumber && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.identificationNumber.message}</span>
                </p>
              )}
            </div>

            {/* Nombres */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nombres *</label>
              <input 
                type="text"
                {...register('firstName')}
                placeholder="Nombres completos"
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  errors.firstName ? 'border-red-500/50 ring-2 ring-red-500/50' : 'border-slate-600/50'
                }`}
              />
              {errors.firstName && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.firstName.message}</span>
                </p>
              )}
            </div>

            {/* Apellidos */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Apellidos *</label>
              <input 
                type="text"
                {...register('lastName')}
                placeholder="Apellidos completos"
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  errors.lastName ? 'border-red-500/50 ring-2 ring-red-500/50' : 'border-slate-600/50'
                }`}
              />
              {errors.lastName && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.lastName.message}</span>
                </p>
              )}
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Fecha de Nacimiento *
              </label>
              <input 
                type="date"
                {...register('dateOfBirth')}
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  errors.dateOfBirth ? 'border-red-500/50 ring-2 ring-red-500/50' : 'border-slate-600/50'
                }`}
              />
              {errors.dateOfBirth && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.dateOfBirth.message}</span>
                </p>
              )}
            </div>

            {/* Género */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Género</label>
              <select 
                {...register('gender')}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
              >
                <option value="">Seleccione...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Teléfono</label>
              <input 
                type="tel"
                {...register('phone')}
                placeholder="+57 300 123 4567"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.phone.message}</span>
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input 
                type="email"
                {...register('email')}
                placeholder="correo@ejemplo.com"
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  errors.email ? 'border-red-500/50 ring-2 ring-red-500/50' : 'border-slate-600/50'
                }`}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Dirección</label>
              <input 
                type="text"
                {...register('address')}
                placeholder="Calle, carrera, número"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ciudad</label>
              <input 
                type="text"
                {...register('city')}
                placeholder="Ciudad"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {/* Departamento */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Departamento</label>
              <input 
                type="text"
                {...register('department')}
                placeholder="Departamento"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {/* Fecha de Contratación */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Fecha de Contratación *
              </label>
              <input 
                type="date"
                {...register('hireDate')}
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  errors.hireDate ? 'border-red-500/50 ring-2 ring-red-500/50' : 'border-slate-600/50'
                }`}
              />
              {errors.hireDate && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.hireDate.message}</span>
                </p>
              )}
            </div>
          </div>

      {/* Sección de Contrato (solo al crear) */}
      {!isEditing && (
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Información del Contrato
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tipo de Contrato *
              </label>
              <select 
                {...register('contract.contractType')}
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all ${
                  (errors as any).contract?.contractType ? 'border-red-500/50 ring-2 ring-red-500/50' : 'border-slate-600/50'
                }`}
              >
                <option value="">Seleccione...</option>
                <option value="indefinido">Indefinido</option>
                <option value="fijo">Fijo</option>
                <option value="obra_labor">Obra o Labor</option>
                <option value="prestacion_servicios">Prestación de Servicios</option>
              </select>
              {(errors as any).contract?.contractType && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{(errors as any).contract.contractType.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cargo *</label>
              <input 
                type="text" 
                {...register('contract.position')}
                placeholder="Ej: Desarrollador Senior"
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all ${
                  (errors as any).contract?.position ? 'border-red-500/50 ring-2 ring-red-500/50' : 'border-slate-600/50'
                }`}
              />
              {(errors as any).contract?.position && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{(errors as any).contract.position.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Departamento *</label>
              <input 
                type="text" 
                {...register('contract.department')}
                placeholder="Ej: Tecnología"
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all ${
                  (errors as any).contract?.department ? 'border-red-500/50 ring-2 ring-red-500/50' : 'border-slate-600/50'
                }`}
              />
              {(errors as any).contract?.department && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{(errors as any).contract.department.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Salario *</label>
              <input 
                type="number" 
                {...register('contract.salary', { valueAsNumber: true })}
                placeholder="Ej: 5000000"
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all ${
                  (errors as any).contract?.salary ? 'border-red-500/50 ring-2 ring-red-500/50' : 'border-slate-600/50'
                }`}
                step="1000"
                min="0"
              />
              {(errors as any).contract?.salary && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{(errors as any).contract.salary.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Fecha de Inicio del Contrato *
              </label>
              <input 
                type="date" 
                {...register('contract.startDate')}
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all ${
                  (errors as any).contract?.startDate ? 'border-red-500/50 ring-2 ring-red-500/50' : 'border-slate-600/50'
                }`}
              />
              {(errors as any).contract?.startDate && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{(errors as any).contract.startDate.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Fecha de Fin (opcional)
              </label>
              <input 
                type="date" 
                {...register('contract.endDate')}
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all ${
                  (errors as any).contract?.endDate ? 'border-red-500/50 ring-2 ring-red-500/50' : 'border-slate-600/50'
                }`}
              />
              {(errors as any).contract?.endDate && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{(errors as any).contract.endDate.message}</span>
                </p>
              )}
              <p className="mt-1 text-xs text-slate-400">
                Solo para contratos con duración definida (fijos)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end gap-4 pt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="px-8 py-3 backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 text-slate-300 font-semibold hover:bg-white/20 transition-all transform hover:scale-105"
        >
          <span className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Cancelar</span>
          </span>
        </button>
        
        <button 
          type="submit"
          disabled={isSubmitting} 
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
        >
          <span className="flex items-center space-x-2">
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{isEditing ? 'Actualizar Empleado' : 'Crear Empleado'}</span>
              </>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}