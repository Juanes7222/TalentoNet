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
      console.error('Error cargando Periodos:', error);
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
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 20 20"><path fill="currentColor" d="M10 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8M7 6a3 3 0 1 1 6 0a3 3 0 0 1-6 0m-1.991 5A2 2 0 0 0 3 13c0 1.691.833 2.966 2.135 3.797C6.183 17.465 7.53 17.845 9 17.96v-1.003c-1.318-.114-2.468-.457-3.327-1.005C4.623 15.283 4 14.31 4 13c0-.553.448-1 1.009-1h11.723A2 2 0 0 0 15 11zM19 14.5v3a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5v-3a1.5 1.5 0 0 1 1.5-1.5h6a1.5 1.5 0 0 1 1.5 1.5m-1 3v-1a1.5 1.5 0 0 0-1.5 1.5h1a.5.5 0 0 1 .5-.5m0-3a.5.5 0 0 1-.5-.5h-1a1.5 1.5 0 0 0 1.5 1.5zm-6.5-.5a.5.5 0 0 1-.5.5v1a1.5 1.5 0 0 0 1.5-1.5zm-.5 3.5a.5.5 0 0 1 .5.5h1a1.5 1.5 0 0 0-1.5-1.5zm3.5-3a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3"/></svg>
              Gestión de Nómina</h1>
            <p className="mt-2 text-slate-400">
              Administra Periodos, novedades y liquidaciones de nómina
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Nuevo Periodo
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 border border-blue-700 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Total Periodos</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <span className="text-4xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="#fff" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16m0 2a1 1 0 0 1 .993.883L13 7v4.586l2.707 2.707a1 1 0 0 1-1.32 1.497l-.094-.083l-3-3a1 1 0 0 1-.284-.576L11 12V7a1 1 0 0 1 1-1"/></g></svg>
              </span>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="17" r="1.3" fill="#fff"/><path fill="#fff" d="M17 10h-1V8c0-2.206-1.794-4-4-4S8 5.794 8 8v2H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2m-7-2a2 2 0 0 1 4 0v3h-4zm7 11H7v-7h10.003z"/></svg>
            </div>
          </button>
        </div>

        {/* Filter Pills */}
        {filter !== 'all' && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M15 19.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L9.29 16.7a.99.99 0 0 1-.29-.83v-5.12L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L15 10.75zM7.04 5L11 10.06v5.52l2 2v-7.53L16.96 5z"/></svg>
              Filtro activo:</span>
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
                    Periodo
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
                      No hay Periodos {filter !== 'all' ? `con estado "${getEstadoLabel(filter as any)}"` : 'registrados'}
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
                          {period.descripcion || `Periodo ${period.id}`}
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
                          className="text-blue-400 hover:text-blue-300 transition flex items-center gap-1 justify-end"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          Ver detalles
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
