import { useParams } from 'react-router-dom';
import { useEmployee } from '../features/employees/hooks';
import FormEmpleado from '../features/employees/components/FormEmpleado';
import type { EmployeeFormData } from '../features/employees/types';
import { useState } from 'react';

export function EmployeeFormPage() {
  const { id } = useParams();
  const { data: employee, isLoading } = useEmployee(id || '');

  // Estado del toast controlado desde la página
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  if (id && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
        email: employee.email || '',
      }
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* TOAST AQUÍ: siempre visible, encima del formulario */}
        {/* TOAST FIJO EN LA ESQUINA SUPERIOR DERECHA - SIEMPRE VISIBLE */}
{notification && (
  <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-3 duration-300">
    <div className={`backdrop-blur-xl rounded-2xl shadow-2xl border p-5 min-w-[320px] max-w-sm ${
      notification.type === 'success' 
        ? 'bg-green-500/20 border-green-500/50' 
        : 'bg-red-500/20 border-red-500/50'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          notification.type === 'success'
            ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/50'
            : 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50'
        }`}>
          {notification.type === 'success' ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-lg mb-1 ${notification.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
            {notification.title}
          </h3>
          <p className="text-slate-300 text-sm">{notification.message}</p>
        </div>
        <button 
          onClick={() => setNotification(null)} 
          className="text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
)}

        {/* Formulario */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            {id ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h2>
          <FormEmpleado 
            employeeId={id} 
            initialData={initialData} 
            onShowNotification={showNotification} 
          />
        </div>
      </div>
    </div>
  );
}