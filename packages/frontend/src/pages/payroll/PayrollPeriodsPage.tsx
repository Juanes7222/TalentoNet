import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPayrollPeriods,
  PayrollPeriod,
  getEstadoBadgeColor,
  getEstadoLabel,
  getRealTimeStats // Asegúrate de importar esta función
} from '../../services/payroll.service';
import CreatePeriodModal from './components/CreatePeriodModal';
import PayrollStatsCards from './components/PayrollStatsCards';

export default function PayrollPeriodsPage() {
  const navigate = useNavigate();
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'abierto' | 'liquidado' | 'aprobado' | 'cerrado'>('all');
  const [stats, setStats] = useState({
    total: 0,
    abiertos: 0,
    liquidados: 0,
    aprobados: 0,
    cerrados: 0,
  });
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [periodsData, realTimeData] = await Promise.all([
        getPayrollPeriods(),
        getRealTimeStats()
      ]);
      
      setPeriods(periodsData);
      setStats(realTimeData.stats);
      setTrendData(realTimeData.trendData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodCreated = () => {
    setShowCreateModal(false);
    loadData(); // Usar loadData en lugar de loadPeriods
  };

  const filteredPeriods = filter === 'all' 
    ? periods 
    : periods.filter(p => p.estado === filter);

  // ELIMINAR esta sección duplicada ↓
  // const stats = {
  //   total: periods.length,
  //   abiertos: periods.filter(p => p.estado === 'abierto').length,
  //   liquidados: periods.filter(p => p.estado === 'liquidado').length,
  //   aprobados: periods.filter(p => p.estado === 'aprobado').length,
  //   cerrados: periods.filter(p => p.estado === 'cerrado').length,
  // };

  const getEstadoBadgeColorModern = (estado: string) => {
    const colors = {
      'abierto': 'bg-blue-500/20 text-blue-300 border border-blue-400/30',
      'liquidado': 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30',
      'aprobado': 'bg-green-500/20 text-green-300 border border-green-400/30',
      'cerrado': 'bg-gray-500/20 text-gray-300 border border-gray-400/30',
    };
    return colors[estado as keyof typeof colors] || colors.cerrado;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            💰 Gestión de Nómina
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Administra períodos, novedades y liquidaciones de nómina
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Período</span>
        </button>
      </div>

      {/* Stats Cards con gráficos */}
      <PayrollStatsCards 
        stats={stats} 
        trendData={trendData}
        onFilterClick={setFilter} 
      />

      {/* Filter indicator */}
      {filter !== 'all' && (
        <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300">Filtro activo:</span>
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getEstadoBadgeColorModern(filter)}`}>
                {getEstadoLabel(filter as any)}
              </span>
            </div>
            <button
              onClick={() => setFilter('all')}
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar filtro
            </button>
          </div>
        </div>
      )}

      {/* Tabla de períodos */}
      <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-600 border-t-blue-500"></div>
                        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
                      </div>
                      <p className="text-slate-400 mt-4">Cargando períodos...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPeriods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <div className="text-center">
                      <div className="text-5xl mb-3">📅</div>
                      <p className="text-slate-300 text-lg mb-1">
                        No hay períodos {filter !== 'all' ? `con estado "${getEstadoLabel(filter as any)}"` : 'registrados'}
                      </p>
                      <p className="text-slate-500 text-sm">
                        {filter !== 'all' ? 'Intenta cambiar el filtro' : 'Crea tu primer período de nómina'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPeriods.map((period, index) => (
                  <tr 
                    key={period.id} 
                    className="hover:bg-white/5 cursor-pointer transition-colors duration-150 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => navigate(`/payroll/${period.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {period.descripcion || `Período ${period.id}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-medium border border-purple-400/30 capitalize">
                        {period.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(period.fechaInicio).toLocaleDateString('es-CO')} - {new Date(period.fechaFin).toLocaleDateString('es-CO')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getEstadoBadgeColorModern(period.estado)}`}>
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
                        className="flex items-center gap-2 ml-auto px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
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

      {/* Create Period Modal */}
      {showCreateModal && (
        <CreatePeriodModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handlePeriodCreated}
        />
      )}

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}