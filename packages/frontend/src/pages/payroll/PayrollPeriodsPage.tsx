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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">💰 Gestión de Nómina</h1>
            <p className="mt-2 text-slate-400">
              Administra períodos, novedades y liquidaciones de nómina
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
          >
            ➕ Nuevo Período
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 border border-blue-700 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Total Períodos</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <span className="text-4xl">📋</span>
            </div>
          </div>

          <button 
            onClick={() => setFilter('abierto')}
            className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl hover:border-blue-500 transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-slate-400 group-hover:text-blue-400">Abiertos</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{stats.abiertos}</p>
              </div>
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            </div>
          </button>

          <button 
            onClick={() => setFilter('liquidado')}
            className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl hover:border-yellow-500 transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-slate-400 group-hover:text-yellow-400">Liquidados</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.liquidados}</p>
              </div>
              <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
            </div>
          </button>

          <button 
            onClick={() => setFilter('aprobado')}
            className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-slate-400 group-hover:text-green-400">Aprobados</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{stats.aprobados}</p>
              </div>
              <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          <button 
            onClick={() => setFilter('cerrado')}
            className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl hover:border-slate-500 transition-all duration-300 cursor-pointer transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-slate-400 group-hover:text-slate-300">Cerrados</p>
                <p className="text-3xl font-bold text-slate-300 mt-2">{stats.cerrados}</p>
              </div>
              <svg className="h-6 w-6 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.414 7.414a2 2 0 00-2.828 0L9.172 9.586 7.07 7.485A2 2 0 104.242 9.657l2.101 2.101 1.414-1.414a2 2 0 012.828 0l4.829-4.829a1 1 0 00-1.414-1.414L13.414 7.414z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        </div>

        {/* Filter Pills */}
        {filter !== 'all' && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">🔍 Filtro activo:</span>
            <span className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-full text-sm font-semibold">
              {getEstadoLabel(filter as any)}
            </span>
            <button
              onClick={() => setFilter('all')}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              ✕ Limpiar
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Período
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Creado
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-700 border-t-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredPeriods.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">
                      No hay períodos {filter !== 'all' ? `con estado "${getEstadoLabel(filter as any)}"` : 'registrados'}
                    </td>
                  </tr>
                ) : (
                  filteredPeriods.map((period) => (
                    <tr 
                      key={period.id} 
                      className="hover:bg-slate-700/50 transition duration-200 cursor-pointer"
                      onClick={() => navigate(`/payroll/${period.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-white">
                          {period.descripcion || `Período ${period.id}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 capitalize">
                          {period.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(period.fechaInicio).toLocaleDateString('es-CO')} - {new Date(period.fechaFin).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                          period.estado === 'abierto'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : period.estado === 'liquidado'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : period.estado === 'aprobado'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }`}>
                          {getEstadoLabel(period.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(period.createdAt).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/payroll/${period.id}`);
                          }}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          👁️ Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
