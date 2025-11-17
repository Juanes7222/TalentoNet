import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPayrollPeriod,
  getPayrollEntries,
  getNovedades,
  liquidatePeriod,
  approvePeriod,
  closePeriod,
  PayrollPeriod,
  PayrollEntry,
  PayrollNovedad,
  getEstadoBadgeColor,
  getEstadoLabel,
  formatCurrency,
} from '../../services/payroll.service';
import AddNovedadModal from './components/AddNovedadModal';

type TabType = 'resumen' | 'novedades' | 'liquidaciones';

export default function PayrollPeriodDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PayrollPeriod | null>(null);
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [novedades, setNovedades] = useState<PayrollNovedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('resumen');
  const [showAddNovedadModal, setShowAddNovedadModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      loadPeriodData();
    }
  }, [id]);

  const loadPeriodData = async () => {
    try {
      setLoading(true);
      const periodData = await getPayrollPeriod(Number(id));
      setPeriod(periodData);

      // Cargar novedades y liquidaciones si el período está liquidado
      const [novedadesData, entriesData] = await Promise.all([
        getNovedades(Number(id)),
        periodData.estado !== 'abierto' ? getPayrollEntries(Number(id)) : Promise.resolve([]),
      ]);

      setNovedades(novedadesData);
      setEntries(entriesData);
    } catch (error) {
      console.error('Error cargando período:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLiquidate = async () => {
    if (!confirm('¿Está seguro de liquidar este período? Esto calculará la nómina para todos los empleados activos.')) {
      return;
    }

    try {
      setProcessing(true);
      await liquidatePeriod(Number(id));
      await loadPeriodData();
      alert('Período liquidado exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al liquidar el período');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('¿Está seguro de aprobar este período?')) {
      return;
    }

    try {
      setProcessing(true);
      await approvePeriod(Number(id), { comentario: 'Aprobado para pago' });
      await loadPeriodData();
      alert('Período aprobado exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al aprobar el período');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = async () => {
    if (!confirm('¿Está seguro de cerrar este período? Esta acción es irreversible.')) {
      return;
    }

    try {
      setProcessing(true);
      await closePeriod(Number(id), { comentario: 'Período cerrado' });
      await loadPeriodData();
      alert('Período cerrado exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cerrar el período');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !period) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  const totalDevengado = entries.reduce((sum, entry) => sum + Number(entry.totalDevengado), 0);
  const totalDeducido = entries.reduce((sum, entry) => sum + Number(entry.totalDeducido), 0);
  const totalNeto = entries.reduce((sum, entry) => sum + Number(entry.neto), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/payroll')}
            className="text-blue-400 hover:text-blue-300 font-medium transition flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ← Volver a períodos
          </button>

          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
            <div className="flex justify-between items-start gap-6 flex-wrap">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  📋 {period.descripcion || `Período ${period.id}`}
                </h1>
                <p className="text-slate-400">
                  {new Date(period.fechaInicio).toLocaleDateString('es-CO')} - {new Date(period.fechaFin).toLocaleDateString('es-CO')}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${
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

                {/* Acciones según estado */}
                {period.estado === 'abierto' && (
                  <>
                    <button
                      onClick={() => setShowAddNovedadModal(true)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition duration-200"
                    >
                      ➕ Agregar Novedad
                    </button>
                    <button
                      onClick={handleLiquidate}
                      disabled={processing}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg disabled:cursor-not-allowed"
                    >
                      {processing ? '⏳ Procesando...' : '💸 Liquidar Período'}
                    </button>
                  </>
                )}

                {period.estado === 'liquidado' && (
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg disabled:cursor-not-allowed"
                  >
                    {processing ? '⏳ Procesando...' : '✓ Aprobar Período'}
                  </button>
                )}

                {period.estado === 'aprobado' && (
                  <button
                    onClick={handleClose}
                    disabled={processing}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition duration-200 shadow-lg disabled:cursor-not-allowed"
                  >
                    {processing ? '⏳ Procesando...' : '🔒 Cerrar Período'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden">
          <div className="flex border-b border-slate-700 bg-slate-900/50">
            {(['resumen', 'novedades', 'liquidaciones'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-900'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab === 'resumen' && '📊 Resumen'}
                {tab === 'novedades' && `➕ Novedades (${novedades.length})`}
                {tab === 'liquidaciones' && `💰 Liquidaciones (${entries.length})`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'resumen' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 border border-slate-600">
                    <p className="text-sm text-slate-400 mb-2">👥 Empleados Liquidados</p>
                    <p className="text-3xl font-bold text-white">{entries.length}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 border border-green-700">
                    <p className="text-sm text-green-300 mb-2">📈 Total Devengado</p>
                    <p className="text-3xl font-bold text-green-400">{formatCurrency(totalDevengado)}</p>
                  </div>

                  <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-6 border border-red-700">
                    <p className="text-sm text-red-300 mb-2">📉 Total Deducido</p>
                    <p className="text-3xl font-bold text-red-400">{formatCurrency(totalDeducido)}</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-700">
                    <p className="text-sm text-blue-300 mb-2">💳 Neto a Pagar</p>
                    <p className="text-3xl font-bold text-blue-400">{formatCurrency(totalNeto)}</p>
                  </div>
                </div>

                {/* Información del período */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-4">ℹ️ Información del Período</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-slate-700">
                      <span className="text-slate-400">Tipo</span>
                      <span className="font-semibold text-white capitalize">{period.tipo}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-700">
                      <span className="text-slate-400">Novedades</span>
                      <span className="font-semibold text-white">{novedades.length} registradas</span>
                    </div>
                    {period.liquidatedAt && (
                      <div className="flex justify-between items-center py-3 border-b border-slate-700">
                        <span className="text-slate-400">Liquidado</span>
                        <span className="font-semibold text-green-400">
                          {new Date(period.liquidatedAt).toLocaleString('es-CO')}
                        </span>
                      </div>
                    )}
                    {period.approvedAt && (
                      <div className="flex justify-between items-center py-3">
                        <span className="text-slate-400">Aprobado</span>
                        <span className="font-semibold text-green-400">
                          {new Date(period.approvedAt).toLocaleString('es-CO')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'novedades' && (
              <div className="space-y-4">
                {period.estado === 'abierto' && (
                  <button
                    onClick={() => setShowAddNovedadModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
                  >
                    ➕ Agregar Novedad
                  </button>
                )}
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-900/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Empleado</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Categoría</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Valor</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Cantidad</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {novedades.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">
                            No hay novedades registradas
                          </td>
                        </tr>
                      ) : (
                        novedades.map((novedad) => (
                          <tr key={novedad.id} className="hover:bg-slate-700/50 transition">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                              {novedad.employee?.firstName} {novedad.employee?.lastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{novedad.tipo}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full border ${
                                novedad.categoria === 'devengo'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }`}>
                                {novedad.categoria}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{formatCurrency(Number(novedad.valor))}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{novedad.cantidad}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                              {formatCurrency(Number(novedad.valor) * Number(novedad.cantidad))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'liquidaciones' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Empleado</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Salario Base</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Devengado</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Deducido</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Neto</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">
                          {period.estado === 'abierto' ? 'El período aún no ha sido liquidado' : 'No hay liquidaciones'}
                        </td>
                      </tr>
                    ) : (
                      entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-700/50 transition">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                            {entry.employee?.firstName} {entry.employee?.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{formatCurrency(Number(entry.salarioBase))}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold">{formatCurrency(Number(entry.totalDevengado))}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">{formatCurrency(Number(entry.totalDeducido))}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 font-semibold">{formatCurrency(Number(entry.neto))}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-400 hover:text-blue-300 transition">👁️ Ver detalle</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Novedad Modal */}
      {showAddNovedadModal && (
        <AddNovedadModal
          periodId={Number(id)}
          onClose={() => setShowAddNovedadModal(false)}
          onSuccess={() => {
            setShowAddNovedadModal(false);
            loadPeriodData();
          }}
        />
      )}
    </div>
  );
}
