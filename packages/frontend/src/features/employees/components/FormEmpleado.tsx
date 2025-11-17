import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { employeeSchema, type EmployeeFormData } from '../types';
import { useCreateEmployee, useUpdateEmployee } from '../hooks';

interface FormEmpleadoProps {
  employeeId?: string;
  initialData?: Partial<EmployeeFormData>;
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
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (isEditing) {
        await updateEmployee.mutateAsync({ id: employeeId, data });
        alert('Empleado actualizado exitosamente');
      } else {
        await createEmployee.mutateAsync(data);
        alert('Empleado creado exitosamente');
      }
      navigate('/employees');
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-slate-700">
          📋 Información Personal
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

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/employees')}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
        >
          ✕ Cancelar
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Guardando...' : isEditing ? '✓ Actualizar' : '✓ Crear Empleado'}
        </button>
      </div>
    </form>
  );
}
