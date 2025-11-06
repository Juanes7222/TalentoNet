import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPayrollPeriods,
  PayrollPeriod,
  getEstadoBadgeColor,
  getEstadoLabel,
} from '../../services/payroll.service';
import CreatePeriodModal from './components/CreatePeriodModal';

export default function PayrollPeriodsPage() {
  const navigate = useNavigate();
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'abierto' | 'liquidado' | 'aprobado' | 'cerrado'>('all');

  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    try {
      setLoading(true);
      const data = await getPayrollPeriods();
      setPeriods(data);
    } catch (error) {
      console.error('Error cargando períodos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodCreated = () => {
    setShowCreateModal(false);
    loadPeriods();
  };

  const filteredPeriods = filter === 'all' 
    ? periods 
    : periods.filter(p => p.estado === filter);

  const stats = {
    total: periods.length,
    abiertos: periods.filter(p => p.estado === 'abierto').length,
    liquidados: periods.filter(p => p.estado === 'liquidado').length,
    aprobados: periods.filter(p => p.estado === 'aprobado').length,
    cerrados: periods.filter(p => p.estado === 'cerrado').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Nómina</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra períodos, novedades y liquidaciones de nómina
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Período
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Períodos</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('abierto')}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Abiertos</dt>
                  <dd className="text-lg font-semibold text-blue-600">{stats.abiertos}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('liquidado')}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Liquidados</dt>
                  <dd className="text-lg font-semibold text-yellow-600">{stats.liquidados}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('aprobado')}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Aprobados</dt>
                  <dd className="text-lg font-semibold text-green-600">{stats.aprobados}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('cerrado')}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Cerrados</dt>
                  <dd className="text-lg font-semibold text-gray-600">{stats.cerrados}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      {filter !== 'all' && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-500">Filtro activo:</span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoBadgeColor(filter as any)}`}>
            {getEstadoLabel(filter as any)}
          </span>
          <button
            onClick={() => setFilter('all')}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Limpiar filtro
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Período
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fechas
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creado
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : filteredPeriods.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay períodos {filter !== 'all' ? `con estado "${getEstadoLabel(filter as any)}"` : 'registrados'}
                </td>
              </tr>
            ) : (
              filteredPeriods.map((period) => (
                <tr 
                  key={period.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/payroll/${period.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {period.descripcion || `Período ${period.id}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                      {period.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(period.fechaInicio).toLocaleDateString('es-CO')} - {new Date(period.fechaFin).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoBadgeColor(period.estado)}`}>
                      {getEstadoLabel(period.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(period.createdAt).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/payroll/${period.id}`);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Period Modal */}
      {showCreateModal && (
        <CreatePeriodModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handlePeriodCreated}
        />
      )}
    </div>
  );
}
