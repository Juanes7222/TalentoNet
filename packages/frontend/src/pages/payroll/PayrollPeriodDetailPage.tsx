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

      // Cargar novedades y liquidaciones si el Periodo está liquidado
      const [novedadesData, entriesData] = await Promise.all([
        getNovedades(Number(id)),
        periodData.estado !== 'abierto' ? getPayrollEntries(Number(id)) : Promise.resolve([]),
      ]);

      setNovedades(novedadesData);
      setEntries(entriesData);
    } catch (error) {
      console.error('Error cargando Periodo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLiquidate = async () => {
    if (!confirm('¿Está seguro de liquidar este Periodo? Esto calculará la nómina para todos los empleados activos.')) {
      return;
    }

    try {
      setProcessing(true);
      await liquidatePeriod(Number(id));
      await loadPeriodData();
      alert('Periodo liquidado exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al liquidar el Periodo');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('¿Está seguro de aprobar este Periodo?')) {
      return;
    }

    try {
      setProcessing(true);
      await approvePeriod(Number(id), { comentario: 'Aprobado para pago' });
      await loadPeriodData();
      alert('Periodo aprobado exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al aprobar el Periodo');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = async () => {
    if (!confirm('¿Está seguro de cerrar este Periodo? Esta acción es irreversible.')) {
      return;
    }

    try {
      setProcessing(true);
      await closePeriod(Number(id), { comentario: 'Periodo cerrado' });
      await loadPeriodData();
      alert('Periodo cerrado exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cerrar el Periodo');
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
            Volver a Periodos
          </button>

          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
            <div className="flex justify-between items-start gap-6 flex-wrap">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="#fff" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16m0 2a1 1 0 0 1 .993.883L13 7v4.586l2.707 2.707a1 1 0 0 1-1.32 1.497l-.094-.083l-3-3a1 1 0 0 1-.284-.576L11 12V7a1 1 0 0 1 1-1"/></g></svg>
                  {period.descripcion || `Periodo ${period.id}`}
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
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition duration-200 felx items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                      Agregar Novedad
                    </button>
                    <button
                      onClick={handleLiquidate}
                      disabled={processing}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><defs><path id="SVGgvnbobcx" d="M21.5 11v10h-19V11z"/></defs><g fill="none"><use href="#SVGgvnbobcx"/><path d="M12 13.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5m5.136-7.209L19 5.67l1.824 5.333H3.002L3 11.004L14.146 2.1z"/><path stroke="#fff" stroke-linecap="square" stroke-width="2" d="M21 11.003h-.176L19.001 5.67L3.354 11.003L3 11m-.5.004H3L14.146 2.1l2.817 3.95"/><g stroke="#fff" stroke-linecap="square" stroke-width="2"><path d="M14.5 16a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0Z"/><use href="#SVGgvnbobcx"/><path d="M2.5 11h2a2 2 0 0 1-2 2zm19 0h-2a2 2 0 0 0 2 2zm-19 10h2.002A2 2 0 0 0 2.5 18.998zm19 0h-2a2 2 0 0 1 2-2z"/></g></g></svg>
                      {processing ? '⏳ Procesando...' : 'Liquidar Periodo'}
                    </button>
                  </>
                )}

                {period.estado === 'liquidado' && (
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg disabled:cursor-not-allowed"
                  >
                    {processing ? '⏳ Procesando...' : '✓ Aprobar Periodo'}
                  </button>
                )}

                {period.estado === 'aprobado' && (
                  <button
                    onClick={handleClose}
                    disabled={processing}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition duration-200 shadow-lg disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m10 15l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-9l-2-2m-9-2h4m-2 19a8 8 0 1 1 0-16a8 8 0 0 1 0 16"/></svg>
                    {processing ? '⏳ Procesando...' : 'Cerrar Periodo'}
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
                
                {tab === 'resumen' &&  'Resumen'}
                {tab === 'novedades' && `Novedades (${novedades.length})`}
                {tab === 'liquidaciones' && `Liquidaciones (${entries.length})`}
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
                    <p className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-200" viewBox="0 0 20 20" fill="currentColor"> <path d="M12 11.385q-1.237 0-2.119-.882T9 8.385t.881-2.12T12 5.386t2.119.88t.881 2.12t-.881 2.118t-2.119.882m-7 7.23V16.97q0-.619.36-1.158q.361-.54.97-.838q1.416-.679 2.834-1.018q1.417-.34 2.836-.34t2.837.34t2.832 1.018q.61.298.97.838q.361.539.361 1.158v1.646zm1-1h12v-.646q0-.332-.215-.625q-.214-.292-.593-.494q-1.234-.598-2.546-.916T12 14.616t-2.646.318t-2.546.916q-.38.202-.593.494Q6 16.637 6 16.97zm6-7.23q.825 0 1.413-.588T14 8.384t-.587-1.412T12 6.384t-1.412.588T10 8.384t.588 1.413t1.412.587m0 7.232"/></svg>
                      Empleados Liquidados</p>
                    <p className="text-3xl font-bold text-white">{entries.length}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 border border-green-700">
                    <p className="text-sm text-green-300 mb-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="#fff" stroke-linecap="round" stroke-width="2"><path stroke-linejoin="round" d="m21 6l-5.293 5.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 0-1.414 0L7 14"/><path d="M3 3v14.8c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C4.52 21 5.08 21 6.2 21H21"/></g></svg>
                      Total Devengado</p>
                    <p className="text-3xl font-bold text-green-400">{formatCurrency(totalDevengado)}</p>
                  </div>

                  <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-6 border border-red-700">
                    <p className="text-sm text-red-300 mb-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="#fff" stroke-linecap="round" stroke-width="1.5"><path d="M22 22H12c-4.714 0-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12V2" opacity="0.5"/><path d="m19 15l-3.118-3.926c-.477-.602-.716-.903-.99-1.05a1.5 1.5 0 0 0-1.357-.029c-.28.135-.531.425-1.035 1.005s-.755.87-1.035 1.005a1.5 1.5 0 0 1-1.356-.03c-.274-.146-.513-.447-.99-1.048L6 7"/></g></svg>
                      Total Deducido</p>
                    <p className="text-3xl font-bold text-red-400">{formatCurrency(totalDeducido)}</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-700">
                    <p className="text-sm text-blue-300 mb-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 56 56"><path fill="#fff" d="M9.625 47.71h36.75c4.898 0 7.36-2.413 7.36-7.241V15.555c0-4.828-2.462-7.266-7.36-7.266H9.625c-4.898 0-7.36 2.438-7.36 7.266v24.914c0 4.828 2.461 7.242 7.36 7.242M6.039 15.767c0-2.438 1.313-3.703 3.656-3.703h36.633c2.32 0 3.633 1.265 3.633 3.703v1.968H6.039Zm3.656 28.172c-2.344 0-3.656-1.243-3.656-3.68V23.055h43.922v17.203c0 2.437-1.313 3.68-3.633 3.68ZM12.39 37h5.743c1.383 0 2.297-.914 2.297-2.25v-4.336c0-1.312-.914-2.25-2.297-2.25H12.39c-1.383 0-2.297.938-2.297 2.25v4.336c0 1.336.914 2.25 2.297 2.25"/></svg>
                      Neto a Pagar</p>
                    <p className="text-3xl font-bold text-blue-400">{formatCurrency(totalNeto)}</p>
                  </div>
                </div>

                {/* Información del Periodo */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2zm1-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/></svg>
                    Información del Periodo</h3>
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
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                    Agregar Novedad
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">
                          {period.estado === 'abierto' ? 'El Periodo aún no ha sido liquidado' : 'No hay liquidaciones'}
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
