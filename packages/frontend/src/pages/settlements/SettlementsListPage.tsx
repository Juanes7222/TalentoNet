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
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Liquidaciones de Contratos</h1>
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
              <span className="text-4xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 1024 1024" fill="currentColor" > <path d="M768 0H416c-35.344 0-64 28.656-64 64h352v256h256v512H736v64h224c35.344 0 64-28.656 64-64V256.016zm0 256V90.496L933.472 256zM64 128c-35.344 0-64 28.656-64 64v768c0 35.344 28.656 64 64 64h544c35.344 0 64-28.656 64-64V384.016L416 128zm544 832H64V192h288v256h256zM416 384V218.496L581.472 384z"/> </svg>
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Borradores</p>
                <p className="text-3xl font-bold text-slate-300 mt-2">{stats.borradores}</p>
              </div>
              <span className="text-4xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path fill="#fff" d="m16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.01 4.01 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53l-4.95-4.95z"/></svg>
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-xl p-6 border border-yellow-700 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-300">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.pendientes}</p>
              </div>
              <span className="text-4xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><g fill="#fff"><path d="M13 6h-2v1a1 1 0 1 0 2 0z"/><path fill-rule="evenodd" d="M6 2v2h1v3a5 5 0 0 0 5 5a5 5 0 0 0-5 5v3H6v2h12v-2h-1v-3a5 5 0 0 0-5-5a5 5 0 0 0 5-5V4h1V2zm3 2h6v3a3 3 0 1 1-6 0zm0 13v3h6v-3a3 3 0 1 0-6 0" clip-rule="evenodd"/></g></svg>
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-6 border border-green-700 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Aprobados</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{stats.aprobados}</p>
              </div>
              <span className="text-4xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path fill="#fff" d="M9 18.25a.74.74 0 0 1-.53-.25l-5-5a.75.75 0 1 1 1.06-1L9 16.44L19.47 6a.75.75 0 0 1 1.06 1l-11 11a.74.74 0 0 1-.53.25"/></svg>
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl p-6 border border-purple-700 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Total Monto</p>
                <p className="text-2xl font-bold text-purple-400 mt-2">{formatCurrency(stats.totalMonto)}</p>
              </div>
              <span className="text-4xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 16 16"><path fill="none" stroke="#fff" stroke-linejoin="round" stroke-miterlimit="10" d="M6 10h2.5c.55 0 1-.45 1-1s-.45-1-1-1h-1c-.55 0-1-.45-1-1s.45-1 1-1H10M8 4.5v1.167M8 9.5v2M14.5 8a6.5 6.5 0 1 1-13 0a6.5 6.5 0 0 1 13 0Z" stroke-width="1"/></svg>
              </span>
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
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1 ${
                filter === 'borrador'
                  ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#fff" d="m16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.01 4.01 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53l-4.95-4.95z"/></svg>
              Borradores ({stats.borradores})
            </button>
            <button
              onClick={() => setFilter('pendiente_aprobacion')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1 ${
                filter === 'pendiente_aprobacion'
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="#fff"><path d="M13 6h-2v1a1 1 0 1 0 2 0z"/><path fill-rule="evenodd" d="M6 2v2h1v3a5 5 0 0 0 5 5a5 5 0 0 0-5 5v3H6v2h12v-2h-1v-3a5 5 0 0 0-5-5a5 5 0 0 0 5-5V4h1V2zm3 2h6v3a3 3 0 1 1-6 0zm0 13v3h6v-3a3 3 0 1 0-6 0" clip-rule="evenodd"/></g></svg>
              Pendientes ({stats.pendientes})
            </button>
            <button
              onClick={() => setFilter('aprobado')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1 ${
                filter === 'aprobado'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#fff" d="M9 18.25a.74.74 0 0 1-.53-.25l-5-5a.75.75 0 1 1 1.06-1L9 16.44L19.47 6a.75.75 0 0 1 1.06 1l-11 11a.74.74 0 0 1-.53.25"/></svg>
              Aprobados ({stats.aprobados})
            </button>
            <button
              onClick={() => setFilter('pagado')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1 ${
                filter === 'pagado'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256"><path fill="#fff" d="M224 48H32a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h192a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16m0 16v24H32V64Zm0 128H32v-88h192zm-16-24a8 8 0 0 1-8 8h-32a8 8 0 0 1 0-16h32a8 8 0 0 1 8 8m-64 0a8 8 0 0 1-8 8h-16a8 8 0 0 1 0-16h16a8 8 0 0 1 8 8"/></svg>
              Pagados ({stats.pagados})
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
