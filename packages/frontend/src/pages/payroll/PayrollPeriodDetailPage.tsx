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
    return <div className="p-6">Cargando...</div>;
  }

  const totalDevengado = entries.reduce((sum, entry) => sum + Number(entry.totalDevengado), 0);
  const totalDeducido = entries.reduce((sum, entry) => sum + Number(entry.totalDeducido), 0);
  const totalNeto = entries.reduce((sum, entry) => sum + Number(entry.neto), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/payroll')}
          className="text-indigo-600 hover:text-indigo-800 mb-2 inline-flex items-center"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a períodos
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{period.descripcion || `Período ${period.id}`}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(period.fechaInicio).toLocaleDateString('es-CO')} - {new Date(period.fechaFin).toLocaleDateString('es-CO')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoBadgeColor(period.estado)}`}>
              {getEstadoLabel(period.estado)}
            </span>

            {/* Acciones según estado */}
            {period.estado === 'abierto' && (
              <>
                <button
                  onClick={() => setShowAddNovedadModal(true)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Agregar Novedad
                </button>
                <button
                  onClick={handleLiquidate}
                  disabled={processing}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {processing ? 'Procesando...' : 'Liquidar Período'}
                </button>
              </>
            )}

            {period.estado === 'liquidado' && (
              <button
                onClick={handleApprove}
                disabled={processing}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Procesando...' : 'Aprobar Período'}
              </button>
            )}

            {period.estado === 'aprobado' && (
              <button
                onClick={handleClose}
                disabled={processing}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
              >
                {processing ? 'Procesando...' : 'Cerrar Período'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`${
              activeTab === 'resumen'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('novedades')}
            className={`${
              activeTab === 'novedades'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Novedades ({novedades.length})
          </button>
          <button
            onClick={() => setActiveTab('liquidaciones')}
            className={`${
              activeTab === 'liquidaciones'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Liquidaciones ({entries.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Empleados Liquidados</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{entries.length}</dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Devengado</dt>
                <dd className="mt-1 text-2xl font-semibold text-green-600">{formatCurrency(totalDevengado)}</dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Deducido</dt>
                <dd className="mt-1 text-2xl font-semibold text-red-600">{formatCurrency(totalDeducido)}</dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Neto a Pagar</dt>
                <dd className="mt-1 text-2xl font-semibold text-indigo-600">{formatCurrency(totalNeto)}</dd>
              </div>
            </div>
          </div>

          {/* Información del período */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Información del Período</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{period.tipo}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Novedades</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{novedades.length} registradas</dd>
                </div>
                {period.liquidatedAt && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Liquidado</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(period.liquidatedAt).toLocaleString('es-CO')}
                    </dd>
                  </div>
                )}
                {period.approvedAt && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Aprobado</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(period.approvedAt).toLocaleString('es-CO')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'novedades' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Novedades del Período</h3>
            {period.estado === 'abierto' && (
              <button
                onClick={() => setShowAddNovedadModal(true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Agregar Novedad
              </button>
            )}
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {novedades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay novedades registradas
                  </td>
                </tr>
              ) : (
                novedades.map((novedad) => (
                  <tr key={novedad.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {novedad.employee?.firstName} {novedad.employee?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{novedad.tipo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${novedad.categoria === 'devengo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {novedad.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(Number(novedad.valor))}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{novedad.cantidad}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(Number(novedad.valor) * Number(novedad.cantidad))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'liquidaciones' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Liquidaciones del Período</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salario Base</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devengado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deducido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Neto</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    {period.estado === 'abierto' ? 'El período aún no ha sido liquidado' : 'No hay liquidaciones'}
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.employee?.firstName} {entry.employee?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(Number(entry.salarioBase))}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(Number(entry.totalDevengado))}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(Number(entry.totalDeducido))}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">{formatCurrency(Number(entry.neto))}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900">Ver detalle</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

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
