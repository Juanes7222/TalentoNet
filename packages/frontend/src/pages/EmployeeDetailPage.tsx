import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useEmployee, useDeleteEmployee } from '../features/employees/hooks';
import GenerateSettlementModal from './employees/components/GenerateSettlementModal';

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading } = useEmployee(id || '');
  const deleteEmployee = useDeleteEmployee();
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('¿Está seguro de desactivar este empleado?')) {
      try {
        await deleteEmployee.mutateAsync(id!);
        alert('Empleado desactivado exitosamente');
        navigate('/employees');
      } catch (err) {
        alert('Error al desactivar empleado');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Empleado no encontrado
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{employee.fullName}</h1>
              <p className="text-slate-400">
                {employee.identificationType}: <span className="text-blue-400 font-semibold">{employee.identificationNumber}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/employees" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition duration-200">
                ← Volver
              </Link>
              <Link to={`/employees/${id}/edit`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200">
                ✏️ Editar
              </Link>
              <button 
                onClick={() => setShowSettlementModal(true)} 
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-200"
              >
                📋 Liquidar
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-200">
                🗑️ Desactivar
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-slate-700">Información Personal</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Tipo de Identificación</p>
              <p className="font-semibold text-white">{employee.identificationType}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Número de Identificación</p>
              <p className="font-semibold text-white">{employee.identificationNumber}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Nombres</p>
              <p className="font-semibold text-white">{employee.firstName}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Apellidos</p>
              <p className="font-semibold text-white">{employee.lastName}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Fecha de Nacimiento</p>
              <p className="font-semibold text-white">{employee.dateOfBirth || 'N/A'}</p>
            </div>
            {employee.gender && (
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Género</p>
                <p className="font-semibold text-white">{employee.gender}</p>
              </div>
            )}
            {employee.phone && (
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Teléfono</p>
                <p className="font-semibold text-white">{employee.phone}</p>
              </div>
            )}
            {employee.address && (
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Dirección</p>
                <p className="font-semibold text-white">{employee.address}</p>
              </div>
            )}
            {employee.city && (
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Ciudad</p>
                <p className="font-semibold text-white">{employee.city}</p>
              </div>
            )}
            {employee.department && (
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Departamento</p>
                <p className="font-semibold text-white">{employee.department}</p>
              </div>
            )}
            {employee.country && (
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">País</p>
                <p className="font-semibold text-white">{employee.country}</p>
              </div>
            )}
          </div>
        </div>

        {/* Work Information Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-slate-700">Información Laboral</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Cargo</p>
              <p className="font-semibold text-white">{employee.position || 'N/A'}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Fecha de Contratación</p>
              <p className="font-semibold text-white">{employee.hireDate || 'N/A'}</p>
            </div>
            {employee.terminationDate && (
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Fecha de Terminación</p>
                <p className="font-semibold text-white">{employee.terminationDate}</p>
              </div>
            )}
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Departamento</p>
              <p className="font-semibold text-white">{employee.department || 'N/A'}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Salario Base</p>
              <p className="font-semibold text-white">{employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 mb-1">Estado</p>
              <p className="font-semibold text-green-400">{employee.status || 'Activo'}</p>
            </div>
          </div>
        </div>

        {/* Settlement Modal */}
        {showSettlementModal && (
          <GenerateSettlementModal
            employeeId={id!}
            employeeName={employee.fullName}
            onClose={() => setShowSettlementModal(false)}
          />
        )}
      </div>
    </div>
  );
}
