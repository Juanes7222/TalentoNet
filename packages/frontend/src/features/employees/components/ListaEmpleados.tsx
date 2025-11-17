import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { useEmployees, useDeleteEmployee } from '../hooks';
import type { Employee } from '../types';

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
  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          🔍 Buscar
        </label>
        <input
          type="text"
          placeholder="Nombre o identificación..."
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          autoComplete="off"
        />
        {searchInput !== searchQuery && (
          <p className="text-xs text-slate-500 mt-2">⏳ Buscando...</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          📊 Estado
        </label>
        <select
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="suspended">Suspendidos</option>
        </select>
      </div>
    </div>
  </div>
));

SearchFilters.displayName = 'SearchFilters';

export default function ListaEmpleados() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(''); // Input del usuario
  const [searchQuery, setSearchQuery] = useState(''); // Query real para la API
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Debounce: actualizar searchQuery después de 500ms de inactividad
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1); // Reset a página 1 cuando cambia la búsqueda
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Memoizar los parámetros para evitar re-renders innecesarios
  const queryParams = useMemo(() => ({
    search: searchQuery,
    status: statusFilter || undefined,
    page,
    limit: 10,
  }), [searchQuery, statusFilter, page]);

  const { data, isLoading, error } = useEmployees(queryParams);

  const deleteEmployee = useDeleteEmployee();

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('¿Está seguro de desactivar este empleado?')) {
      try {
        await deleteEmployee.mutateAsync(id);
        alert('Empleado desactivado exitosamente');
      } catch (err) {
        alert('Error al desactivar empleado');
      }
    }
  }, [deleteEmployee]);

  if (isLoading && !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
        ⚠️ Error cargando empleados: {error instanceof Error ? error.message : 'Error desconocido'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">👥 Empleados</h1>
        <Link
          to="/employees/new"
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
        >
          ➕ Nuevo Empleado
        </Link>
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
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Identificación
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Nombre Completo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Ciudad
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Fecha Contratación
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data?.data.map((employee: Employee) => (
                <tr key={employee.id} className="hover:bg-slate-700/50 transition duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-medium">
                    {employee.identificationType} <span className="text-blue-400">{employee.identificationNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-white">
                      {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {employee.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.status === 'active'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {employee.status === 'active' ? '✓ Activo' : '✕ Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {new Date(employee.hireDate).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <Link
                      to={`/employees/${employee.id}`}
                      className="text-blue-400 hover:text-blue-300 transition duration-200"
                    >
                      👁️ Ver
                    </Link>
                    <Link
                      to={`/employees/${employee.id}/edit`}
                      className="text-yellow-400 hover:text-yellow-300 transition duration-200"
                    >
                      ✏️ Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="text-red-400 hover:text-red-300 transition duration-200"
                    >
                      🗑️ Desactivar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-slate-400">
          Mostrando <span className="text-white font-semibold">{((data?.page || 1) - 1) * (data?.limit || 10) + 1}</span> a{' '}
          <span className="text-white font-semibold">{Math.min((data?.page || 1) * (data?.limit || 10), data?.total || 0)}</span> de{' '}
          <span className="text-white font-semibold">{data?.total || 0}</span> empleados
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition duration-200"
          >
            ← Anterior
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data || page >= Math.ceil(data.total / data.limit)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition duration-200"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
