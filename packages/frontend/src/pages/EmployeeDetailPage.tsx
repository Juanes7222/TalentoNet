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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-blue-500"></div>
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center p-4">
        <div className="backdrop-blur-xl bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl max-w-md">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Empleado no encontrado</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-4">
        {/* Header compacto */}
        <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Info principal */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">{employee.fullName}</h1>
                <p className="text-sm text-slate-400">
                  {employee.identificationType} {employee.identificationNumber}
                </p>
              </div>
            </div>

            {/* Botones de acción compactos */}
            <div className="flex flex-wrap gap-2">
              <Link 
                to="/employees" 
                className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-white text-sm rounded-lg border border-slate-600/50 transition-all duration-200 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Volver</span>
              </Link>
              <Link 
                to={`/employees/${id}/edit`} 
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all duration-200 flex items-center space-x-1 shadow-lg shadow-blue-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Editar</span>
              </Link>
              <button 
                onClick={() => setShowSettlementModal(true)} 
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-all duration-200 flex items-center space-x-1 shadow-lg shadow-purple-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Liquidar</span>
              </button>
              <button 
                onClick={handleDelete} 
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-all duration-200 flex items-center space-x-1 shadow-lg shadow-red-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span className="hidden sm:inline">Desactivar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Grid de información en 2 columnas */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Información Personal */}
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">Información Personal</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoItem label="Tipo ID" value={employee.identificationType} />
              <InfoItem label="Número ID" value={employee.identificationNumber} />
              <InfoItem label="Nombres" value={employee.firstName} />
              <InfoItem label="Apellidos" value={employee.lastName} />
              <InfoItem 
                label="Fecha Nacimiento" 
                value={`${new Date(employee.dateOfBirth).toLocaleDateString('es-CO')} (${employee.age} años)`}
                fullWidth 
              />
              {employee.gender && (
                <InfoItem 
                  label="Género" 
                  value={employee.gender === 'M' ? 'Masculino' : employee.gender === 'F' ? 'Femenino' : 'Otro'} 
                />
              )}
              {employee.phone && <InfoItem label="Teléfono" value={employee.phone} />}
              {employee.city && <InfoItem label="Ciudad" value={employee.city} />}
              {employee.department && <InfoItem label="Departamento" value={employee.department} />}
              {employee.country && <InfoItem label="País" value={employee.country} />}
              {employee.address && (
                <InfoItem label="Dirección" value={employee.address} fullWidth />
              )}
            </div>
          </div>

          {/* Información Laboral */}
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">Información Laboral</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoItem 
                label="Fecha Contratación" 
                value={new Date(employee.hireDate).toLocaleDateString('es-CO')}
                fullWidth 
              />
              {employee.terminationDate && (
                <InfoItem 
                  label="Fecha Terminación" 
                  value={new Date(employee.terminationDate).toLocaleDateString('es-CO')}
                  fullWidth 
                />
              )}
              <div className="col-span-2">
                <p className="text-slate-400 text-xs mb-1">Estado</p>
                <span
                  className={`px-2 py-1 inline-flex text-xs font-semibold rounded-lg ${
                    employee.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 
                    employee.status === 'inactive' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}
                >
                  {employee.status === 'active' ? '✓ Activo' : 
                   employee.status === 'inactive' ? '✗ Inactivo' : '⏸ Suspendido'}
                </span>
              </div>
              <InfoItem 
                label="Fecha Registro" 
                value={new Date(employee.createdAt).toLocaleDateString('es-CO')} 
              />
              <InfoItem 
                label="Última Actualización" 
                value={new Date(employee.updatedAt).toLocaleDateString('es-CO')} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Generar Liquidación */}
      {showSettlementModal && (
        <GenerateSettlementModal
          employeeId={id!}
          employeeName={employee.fullName}
          onClose={() => setShowSettlementModal(false)}
        />
      )}
    </div>
  );
}

// Componente auxiliar para campos de información
function InfoItem({ label, value, fullWidth = false }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-medium text-sm break-words">{value}</p>
    </div>
  );
}