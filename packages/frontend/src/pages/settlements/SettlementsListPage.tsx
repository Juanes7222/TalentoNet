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
    return <div className="p-6">Cargando liquidaciones...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Liquidaciones de Contratos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestión de liquidaciones definitivas con prestaciones sociales
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Liquidaciones</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Borradores</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-600">{stats.borradores}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Pendientes</dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats.pendientes}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Aprobados</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.aprobados}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Monto</dt>
            <dd className="mt-1 text-2xl font-semibold text-indigo-600">{formatCurrency(stats.totalMonto)}</dd>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === '' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos ({settlements.length})
          </button>
          <button
            onClick={() => setFilter('borrador')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'borrador' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Borradores ({stats.borradores})
          </button>
          <button
            onClick={() => setFilter('pendiente_aprobacion')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'pendiente_aprobacion'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pendientes ({stats.pendientes})
          </button>
          <button
            onClick={() => setFilter('aprobado')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'aprobado' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Aprobados ({stats.aprobados})
          </button>
          <button
            onClick={() => setFilter('pagado')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'pagado' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pagados ({stats.pagados})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empleado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cargo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Liquidación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Días Trabajados
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSettlements.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay liquidaciones {filter ? `en estado "${getEstadoLabel(filter)}"` : 'registradas'}
                </td>
              </tr>
            ) : (
              filteredSettlements.map((settlement) => (
                <tr
                  key={settlement.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/settlements/${settlement.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {settlement.employee?.firstName} {settlement.employee?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{settlement.employee?.documentNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {settlement.contract?.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(settlement.fechaLiquidacion).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {settlement.diasTrabajados} días
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(Number(settlement.totalLiquidacion))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeColor(settlement.estado)}`}>
                      {getEstadoLabel(settlement.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/settlements/${settlement.id}`);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
