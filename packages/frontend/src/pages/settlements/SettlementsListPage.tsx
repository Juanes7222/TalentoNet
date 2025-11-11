import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllSettlements,
  ContractSettlement,
  getEstadoLabel,
  getEstadoBadgeColor,
  formatCurrency,
} from '../../services/settlement.service';

export default function SettlementsListPage() {
  const navigate = useNavigate();
  const [settlements, setSettlements] = useState<ContractSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadSettlements();
  }, []);

  const loadSettlements = async () => {
    try {
      setLoading(true);
      const data = await getAllSettlements();
      setSettlements(data);
    } catch (error) {
      console.error('Error cargando liquidaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSettlements = settlements.filter((settlement) => {
    if (!filter) return true;
    return settlement.estado === filter;
  });

  // Calcular estadísticas
  const stats = {
    total: settlements.length,
    borradores: settlements.filter((s) => s.estado === 'borrador').length,
    pendientes: settlements.filter((s) => s.estado === 'pendiente_aprobacion').length,
    aprobados: settlements.filter((s) => s.estado === 'aprobado').length,
    pagados: settlements.filter((s) => s.estado === 'pagado').length,
    totalMonto: settlements.reduce((sum, s) => sum + Number(s.totalLiquidacion), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center">
        <div className="text-xl text-slate-300">Cargando liquidaciones...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>

      <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Liquidaciones de Contratos
              </h1>
              <p className="text-slate-300">Gestión de liquidaciones definitivas con prestaciones sociales</p>
            </div>
            
           
          </div>
        </div>

        {/* Stats Cards - Ultra Compactas */}
<div className="grid grid-cols-5 gap-2 mb-4">
  {/* Total Liquidaciones */}
  <div className="group backdrop-blur-xl bg-white/10 rounded-lg shadow-lg border border-white/20 p-2 transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
    <div className="relative z-10">
      <div className="flex justify-center mb-1">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center shadow-md shadow-blue-500/50 group-hover:rotate-6 transition-transform duration-300">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>
      <h3 className="text-[10px] font-semibold text-slate-300 text-center mb-1">Total</h3>
      <p className="text-lg font-bold text-transparent bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-center mb-0.5">{stats.total}</p>
      <p className="text-[9px] text-slate-400 text-center">Liquid.</p>
    </div>
  </div>

  {/* Borradores */}
  <div className="group backdrop-blur-xl bg-white/10 rounded-lg shadow-lg border border-white/20 p-2 transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
    <div className="relative z-10">
      <div className="flex justify-center mb-1">
        <div className="w-6 h-6 bg-gradient-to-br from-gray-500 to-gray-600 rounded-md flex items-center justify-center shadow-md shadow-gray-500/50 group-hover:rotate-6 transition-transform duration-300">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
      </div>
      <h3 className="text-[10px] font-semibold text-slate-300 text-center mb-1">Borradores</h3>
      <p className="text-lg font-bold text-transparent bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-center mb-0.5">{stats.borradores}</p>
      <p className="text-[9px] text-slate-400 text-center">Edición</p>
    </div>
  </div>

  {/* Pendientes */}
  <div className="group backdrop-blur-xl bg-white/10 rounded-lg shadow-lg border border-white/20 p-2 transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
    <div className="relative z-10">
      <div className="flex justify-center mb-1">
        <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-md flex items-center justify-center shadow-md shadow-yellow-500/50 group-hover:rotate-6 transition-transform duration-300">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <h3 className="text-[10px] font-semibold text-slate-300 text-center mb-1">Pendientes</h3>
      <p className="text-lg font-bold text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-center mb-0.5">{stats.pendientes}</p>
      <p className="text-[9px] text-slate-400 text-center">Por aprobar</p>
    </div>
  </div>

  {/* Aprobados */}
  <div className="group backdrop-blur-xl bg-white/10 rounded-lg shadow-lg border border-white/20 p-2 transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
    <div className="relative z-10">
      <div className="flex justify-center mb-1">
        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-md flex items-center justify-center shadow-md shadow-green-500/50 group-hover:rotate-6 transition-transform duration-300">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h3 className="text-[10px] font-semibold text-slate-300 text-center mb-1">Aprobados</h3>
      <p className="text-lg font-bold text-transparent bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-center mb-0.5">{stats.aprobados}</p>
      <p className="text-[9px] text-slate-400 text-center">Listos</p>
    </div>
  </div>

  {/* Total Monto */}
  <div className="group backdrop-blur-xl bg-white/10 rounded-lg shadow-lg border border-white/20 p-2 transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
    <div className="relative z-10">
      <div className="flex justify-center mb-1">
        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md flex items-center justify-center shadow-md shadow-purple-500/50 group-hover:rotate-6 transition-transform duration-300">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
      </div>
      <h3 className="text-[10px] font-semibold text-slate-300 text-center mb-1">Total Monto</h3>
      <p className="text-sm font-bold text-transparent bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-center mb-0.5">{formatCurrency(stats.totalMonto)}</p>
      <p className="text-[9px] text-slate-400 text-center">Valor</p>
    </div>
  </div>
</div>

        {/* Filtros */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <label className="text-sm font-medium text-slate-300 shrink-0">Filtrar por estado:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '', label: 'Todos', count: settlements.length },
                { value: 'borrador', label: 'Borradores', count: stats.borradores },
                { value: 'pendiente_aprobacion', label: 'Pendientes', count: stats.pendientes },
                { value: 'aprobado', label: 'Aprobados', count: stats.aprobados },
                { value: 'pagado', label: 'Pagados', count: stats.pagados },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    filter === item.value
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'backdrop-blur-sm bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {item.label} ({item.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {filteredSettlements.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg mb-2">No hay liquidaciones {filter ? `en estado "${getEstadoLabel(filter)}"` : 'registradas'}</p>
              <p className="text-sm">Crea tu primera liquidación para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Fecha Liquidación
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Días Trabajados
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSettlements.map((settlement) => (
                    <tr 
                      key={settlement.id} 
                      className="group hover:bg-white/5 transition-all duration-300 transform hover:scale-[1.01] cursor-pointer"
                      onClick={() => navigate(`/settlements/${settlement.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-200">
                              {settlement.employee?.firstName} {settlement.employee?.lastName}
                            </div>
                            <div className="text-xs text-slate-400">
                              {settlement.employee?.documentNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-200">{settlement.contract?.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(settlement.fechaLiquidacion).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {settlement.diasTrabajados} días
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-400">
                          {formatCurrency(Number(settlement.totalLiquidacion))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadgeColor(settlement.estado)}`}>
                          {getEstadoLabel(settlement.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/settlements/${settlement.id}`);
                          }}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-blue-300 hover:text-blue-200 transition-all duration-300 transform hover:scale-110"
                          title="Ver detalle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}