import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { useEmployees, useDeleteEmployee } from '../hooks';
import type { Employee } from '../types';

// Componente de alerta personalizada
const CustomAlert = memo(({ 
  type = 'info', 
  message, 
  onClose 
}: { 
  type: 'success' | 'error' | 'warning' | 'confirm';
  message: string;
  onClose: (confirmed?: boolean) => void;
}) => {
  const configs = {
    success: {
      bgGradient: 'from-green-500 to-emerald-600',
      icon: 'M5 13l4 4L19 7',
      iconBg: 'bg-green-500/20',
      borderColor: 'border-green-500/30'
    },
    error: {
      bgGradient: 'from-red-500 to-rose-600',
      icon: 'M6 18L18 6M6 6l12 12',
      iconBg: 'bg-red-500/20',
      borderColor: 'border-red-500/30'
    },
    warning: {
      bgGradient: 'from-yellow-500 to-amber-600',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      iconBg: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30'
    },
    confirm: {
      bgGradient: 'from-blue-500 to-purple-600',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      iconBg: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    }
  };

  const config = configs[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="backdrop-blur-xl bg-slate-900/95 rounded-2xl border border-white/20 p-6 max-w-md w-full shadow-2xl transform animate-scale-in">
        {/* Icono */}
        <div className="flex items-center justify-center mb-4">
          <div className={`w-16 h-16 rounded-full ${config.iconBg} border ${config.borderColor} flex items-center justify-center`}>
            <svg className={`w-8 h-8 text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
            </svg>
          </div>
        </div>

        {/* Mensaje */}
        <p className="text-center text-white text-lg mb-6">{message}</p>

        {/* Botones */}
        <div className="flex gap-3">
          {type === 'confirm' ? (
            <>
              <button
                onClick={() => onClose(false)}
                className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all duration-200 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => onClose(true)}
                className={`flex-1 px-4 py-3 bg-gradient-to-r ${config.bgGradient} hover:opacity-90 text-white rounded-xl transition-all duration-200 font-medium shadow-lg`}
              >
                Confirmar
              </button>
            </>
          ) : (
            <button
              onClick={() => onClose()}
              className={`w-full px-4 py-3 bg-gradient-to-r ${config.bgGradient} hover:opacity-90 text-white rounded-xl transition-all duration-200 font-medium shadow-lg`}
            >
              Aceptar
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

CustomAlert.displayName = 'CustomAlert';

// Componente memoizado para los filtros
const SearchFilters = memo(({ 
  searchInput, 
  setSearchInput, 
  searchQuery,
  statusFilter, 
  setStatusFilter,
  setPage 
}: {
  searchInput: string;
  setSearchInput: (value: string) => void;
  searchQuery: string;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  setPage: (page: number) => void;
}) => (
  <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Buscar
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Nombre o identificación..."
            className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            autoComplete="off"
          />
        </div>
        {searchInput !== searchQuery && (
          <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Buscando...
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Estado
        </label>
        <select
          className="block w-full px-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="suspended">Suspendidos</option>
        </select>
      </div>
    </div>
  </div>
));

SearchFilters.displayName = 'SearchFilters';

// Componente para las acciones de la tabla
const EmployeeActions = memo(({ employee, onDelete }: { employee: Employee; onDelete: (id: string) => void }) => (
  <div className="flex gap-1">
    <Link
      to={`/employees/${employee.id}`}
      className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 rounded-lg transition-all duration-200 flex items-center gap-1 text-blue-300 hover:text-blue-200"
      title="Ver detalles"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </Link>
    <Link
      to={`/employees/${employee.id}/edit`}
      className="p-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 hover:border-purple-500/50 rounded-lg transition-all duration-200 flex items-center gap-1 text-purple-300 hover:text-purple-200"
      title="Editar"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </Link>
    <button
      onClick={() => onDelete(employee.id)}
      className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all duration-200 flex items-center gap-1 text-red-300 hover:text-red-200"
      title="Desactivar"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    </button>
  </div>
));

EmployeeActions.displayName = 'EmployeeActions';

export default function ListaEmpleados() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'confirm'; message: string; onConfirm?: () => void } | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const queryParams = useMemo(() => ({
    search: searchQuery,
    status: statusFilter || undefined,
    page,
    limit: 10,
  }), [searchQuery, statusFilter, page]);

  const { data, isLoading, error } = useEmployees(queryParams);
  const deleteEmployee = useDeleteEmployee();

  const handleDelete = useCallback((id: string) => {
    setAlert({
      type: 'confirm',
      message: '¿Está seguro de que desea desactivar este empleado?',
      onConfirm: async () => {
        try {
          await deleteEmployee.mutateAsync(id);
          setAlert({ type: 'success', message: '¡Empleado desactivado exitosamente!' });
        } catch (err) {
          setAlert({ type: 'error', message: 'Error al desactivar el empleado. Inténtalo de nuevo.' });
        }
      }
    });
  }, [deleteEmployee]);

  const handleAlertClose = (confirmed?: boolean) => {
    if (confirmed && alert?.onConfirm) {
      alert.onConfirm();
    }
    setAlert(null);
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-blue-500"></div>
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center p-4">
        <div className="backdrop-blur-xl bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl max-w-md">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Error cargando empleados: {error instanceof Error ? error.message : 'Error desconocido'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Alertas personalizadas */}
        {alert && (
          <CustomAlert
            type={alert.type}
            message={alert.message}
            onClose={handleAlertClose}
          />
        )}

        {/* Header */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Empleados
              </h1>
              <p className="text-slate-400 text-sm mt-1">Gestiona tu equipo de trabajo</p>
            </div>
            <Link
              to="/employees/new"
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nuevo Empleado</span>
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <SearchFilters
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          setPage={setPage}
        />

        {/* Tabla */}
        <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Ciudad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4- py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Contratación
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.data.map((employee: Employee) => (
                  <tr key={employee.id} className="hover:bg-white/5 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate max-w-[180px]">
                            {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                          </div>
                          <div className="text-xs text-slate-400 truncate max-w-[180px]">
                            {employee.identificationType} {employee.identificationNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-300">
                        {employee.city || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg ${
                          employee.status === 'active'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : employee.status === 'inactive'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}
                      >
                        {employee.status === 'active' ? 'Activo' : employee.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-400">
                        {new Date(employee.hireDate).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <EmployeeActions employee={employee} onDelete={handleDelete} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {(!data?.data || data.data.length === 0) && (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-lg mb-2">No hay empleados registrados</p>
              <p className="text-sm">Crea tu primer empleado para comenzar</p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {data && data.total > 0 && (
          <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-slate-300">
                Mostrando <span className="font-semibold text-white">{((data?.page || 1) - 1) * (data?.limit || 10) + 1}</span> a{' '}
                <span className="font-semibold text-white">{Math.min((data?.page || 1) * (data?.limit || 10), data?.total || 0)}</span> de{' '}
                <span className="font-semibold text-white">{data?.total || 0}</span> empleados
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data || page >= Math.ceil(data.total / data.limit)}
                  className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  Siguiente
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scale-in {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
          .animate-scale-in {
            animation: scale-in 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}