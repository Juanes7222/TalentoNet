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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white">📋 Liquidaciones de Contratos</h1>
          <p className="mt-2 text-slate-400">
            Gestión de liquidaciones definitivas con prestaciones sociales
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 border border-blue-700 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Total Liquidaciones</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <span className="text-4xl">📋</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Borradores</p>
                <p className="text-3xl font-bold text-slate-300 mt-2">{stats.borradores}</p>
              </div>
              <span className="text-4xl">📝</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-xl p-6 border border-yellow-700 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-300">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.pendientes}</p>
              </div>
              <span className="text-4xl">⏳</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-6 border border-green-700 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Aprobados</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{stats.aprobados}</p>
              </div>
              <span className="text-4xl">✓</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl p-6 border border-purple-700 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Total Monto</p>
                <p className="text-2xl font-bold text-purple-400 mt-2">{formatCurrency(stats.totalMonto)}</p>
              </div>
              <span className="text-4xl">💰</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700 shadow-xl overflow-x-auto">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                filter === ''
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              Todos ({settlements.length})
            </button>
            <button
              onClick={() => setFilter('borrador')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                filter === 'borrador'
                  ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              📝 Borradores ({stats.borradores})
            </button>
            <button
              onClick={() => setFilter('pendiente_aprobacion')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                filter === 'pendiente_aprobacion'
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              ⏳ Pendientes ({stats.pendientes})
            </button>
            <button
              onClick={() => setFilter('aprobado')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                filter === 'aprobado'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              ✓ Aprobados ({stats.aprobados})
            </button>
            <button
              onClick={() => setFilter('pagado')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                filter === 'pagado'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              💳 Pagados ({stats.pagados})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Fecha Liquidación
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Días Trabajados
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredSettlements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-400">
                      No hay liquidaciones {filter ? `en estado "${getEstadoLabel(filter)}"` : 'registradas'}
                    </td>
                  </tr>
                ) : (
                  filteredSettlements.map((settlement) => (
                    <tr
                      key={settlement.id}
                      className="hover:bg-slate-700/50 transition duration-200 cursor-pointer"
                      onClick={() => navigate(`/settlements/${settlement.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-white">
                          {settlement.employee?.firstName} {settlement.employee?.lastName}
                        </div>
                        <div className="text-sm text-slate-400">{settlement.employee?.documentNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {settlement.contract?.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(settlement.fechaLiquidacion).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {settlement.diasTrabajados} días
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-400">
                        {formatCurrency(Number(settlement.totalLiquidacion))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                          settlement.estado === 'borrador'
                            ? 'bg-slate-700/50 text-slate-300 border-slate-600'
                            : settlement.estado === 'pendiente_aprobacion'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : settlement.estado === 'aprobado'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : settlement.estado === 'pagado'
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {getEstadoLabel(settlement.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/settlements/${settlement.id}`);
                          }}
                          className="text-blue-400 hover:text-blue-300 transition font-semibold"
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
    </div>
  );
}
