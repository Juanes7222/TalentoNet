import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getSettlement,
  ContractSettlement,
  getEstadoLabel,
  getEstadoBadgeColor,
  formatCurrency,
  canEdit,
  canApprove,
  canReject,
  canMarkAsPaid,
} from '../../services/settlement.service';
import EditSettlementModal from './components/EditSettlementModal';
import ApproveModal from './components/ApproveModal';
import RejectModal from './components/RejectModal';
import MarkAsPaidModal from './components/MarkAsPaidModal';

export default function SettlementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [settlement, setSettlement] = useState<ContractSettlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPaidModal, setShowPaidModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadSettlement();
    }
  }, [id]);

  const loadSettlement = async () => {
    try {
      setLoading(true);
      const data = await getSettlement(id!);
      setSettlement(data);
    } catch (error) {
      console.error('Error cargando liquidación:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setShowApproveModal(false);
    await loadSettlement();
  };

  const handleReject = async () => {
    setShowRejectModal(false);
    await loadSettlement();
  };

  const handleUpdate = async () => {
    setShowEditModal(false);
    await loadSettlement();
  };

  const handleMarkAsPaid = async () => {
    setShowPaidModal(false);
    await loadSettlement();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
        <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
          ⚠️ Liquidación no encontrada
        </div>
      </div>
    );
  }

  const detalleCalculo = settlement.detalleJson?.calculoAutomatico || {};
  const advertencias = settlement.detalleJson?.advertencias || [];
  const ajustesManuales = settlement.detalleJson?.ajustesManuales || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/settlements')}
            className="text-blue-400 hover:text-blue-300 font-medium transition flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ← Volver a liquidaciones
          </button>

          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
            <div className="flex justify-between items-start gap-6 flex-wrap">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  📋 Liquidación de Contrato
                </h1>
                <p className="text-slate-400">
                  {settlement.employee?.firstName} {settlement.employee?.lastName} - {settlement.contract?.position}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${
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

                {/* Acciones según estado */}
                {canEdit(settlement) && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition duration-200"
                  >
                    ✏️ Editar Valores
                  </button>
                )}

                {canApprove(settlement) && (
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
                  >
                    ✓ Aprobar
                  </button>
                )}

                {canReject(settlement) && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
                  >
                    ✕ Rechazar
                  </button>
                )}

                {canMarkAsPaid(settlement) && (
                  <button
                    onClick={() => setShowPaidModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
                  >
                    💳 Marcar como Pagada
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Advertencias */}
        {advertencias.length > 0 && (
          <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-6 shadow-xl">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-yellow-400">⚠️ Advertencias</h3>
                <div className="mt-3 space-y-1 text-sm text-yellow-300">
                  {advertencias.map((adv: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>{adv}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal - Desglose */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumen de conceptos */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
              <div className="px-6 py-5 bg-slate-900/50 border-b border-slate-700">
                <h3 className="text-xl font-bold text-white">📊 Desglose de Liquidación</h3>
              </div>
              <div className="divide-y divide-slate-700">
                <div className="px-6 py-4 flex justify-between items-center hover:bg-slate-700/30 transition">
                  <div>
                    <dt className="text-sm font-medium text-slate-300">Cesantías</dt>
                    {detalleCalculo.cesantias && (
                      <dd className="text-xs text-slate-500 mt-1">{detalleCalculo.cesantias.formula}</dd>
                    )}
                  </div>
                  <span className="text-lg font-semibold text-white">{formatCurrency(Number(settlement.cesantias))}</span>
                </div>

                <div className="px-6 py-4 flex justify-between items-center hover:bg-slate-700/30 transition">
                  <div>
                    <dt className="text-sm font-medium text-slate-300">Intereses sobre Cesantías</dt>
                    {detalleCalculo.intereses && (
                      <dd className="text-xs text-slate-500 mt-1">{detalleCalculo.intereses.formula}</dd>
                    )}
                  </div>
                  <span className="text-lg font-semibold text-white">{formatCurrency(Number(settlement.interesesCesantias))}</span>
                </div>

                <div className="px-6 py-4 flex justify-between items-center hover:bg-slate-700/30 transition">
                  <div>
                    <dt className="text-sm font-medium text-slate-300">Prima de Servicios</dt>
                    {detalleCalculo.prima && (
                      <dd className="text-xs text-slate-500 mt-1">{detalleCalculo.prima.formula}</dd>
                    )}
                  </div>
                  <span className="text-lg font-semibold text-white">{formatCurrency(Number(settlement.primaServicios))}</span>
                </div>

                <div className="px-6 py-4 flex justify-between items-center hover:bg-slate-700/30 transition">
                  <div>
                    <dt className="text-sm font-medium text-slate-300">Vacaciones</dt>
                    {detalleCalculo.vacaciones && (
                      <dd className="text-xs text-slate-500 mt-1">{detalleCalculo.vacaciones.formula}</dd>
                    )}
                  </div>
                  <span className="text-lg font-semibold text-white">{formatCurrency(Number(settlement.vacaciones))}</span>
                </div>

                {Number(settlement.indemnizacion) > 0 && (
                  <div className="px-6 py-4 flex justify-between items-center hover:bg-slate-700/30 transition">
                    <div>
                      <dt className="text-sm font-medium text-slate-300">
                        Indemnización
                        {settlement.tipoIndemnizacion && (
                          <div className="text-xs text-slate-500 mt-1">
                            ({settlement.tipoIndemnizacion.replace('_', ' ')})
                          </div>
                        )}
                      </dt>
                      {detalleCalculo.indemnizacion && (
                        <dd className="text-xs text-slate-500 mt-1">{detalleCalculo.indemnizacion.formula}</dd>
                      )}
                    </div>
                    <span className="text-lg font-semibold text-white">{formatCurrency(Number(settlement.indemnizacion))}</span>
                  </div>
                )}

                {Number(settlement.otrosConceptos) > 0 && (
                  <div className="px-6 py-4 flex justify-between items-center hover:bg-slate-700/30 transition">
                    <dt className="text-sm font-medium text-slate-300">Otros Conceptos</dt>
                    <span className="text-lg font-semibold text-white">{formatCurrency(Number(settlement.otrosConceptos))}</span>
                  </div>
                )}

                {Number(settlement.deducciones) > 0 && (
                  <div className="px-6 py-4 flex justify-between items-center hover:bg-slate-700/30 transition">
                    <dt className="text-sm font-medium text-slate-300">Deducciones</dt>
                    <span className="text-lg font-semibold text-red-400">- {formatCurrency(Number(settlement.deducciones))}</span>
                  </div>
                )}

                <div className="px-6 py-6 bg-gradient-to-r from-blue-900 to-blue-800 flex justify-between items-center border-t-2 border-blue-700">
                  <dt className="text-lg font-bold text-blue-100">TOTAL A PAGAR</dt>
                  <dd className="text-3xl font-bold text-blue-400">
                    {formatCurrency(Number(settlement.totalLiquidacion))}
                  </dd>
                </div>
              </div>
            </div>

            {/* Ajustes manuales */}
            {ajustesManuales.length > 0 && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
                <div className="px-6 py-5 bg-slate-900/50 border-b border-slate-700">
                  <h3 className="text-xl font-bold text-white">📝 Historial de Ajustes Manuales</h3>
                </div>
                <div className="divide-y divide-slate-700">
                  {ajustesManuales.map((ajuste: any, idx: number) => (
                    <div key={idx} className="px-6 py-4 hover:bg-slate-700/30 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-medium text-blue-400">
                          {new Date(ajuste.fecha).toLocaleString('es-CO')}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {ajuste.cambios.map((c: any, i: number) => (
                          <div key={i} className="text-sm text-slate-300">
                            <strong className="text-white">{c.campo}:</strong> {formatCurrency(c.anterior)} → {formatCurrency(c.nuevo)}
                          </div>
                        ))}
                      </div>
                      {ajuste.justificacion && (
                        <div className="text-sm text-slate-400 mt-3 italic border-l-2 border-slate-600 pl-3">
                          💬 {ajuste.justificacion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna lateral - Info adicional */}
          <div className="space-y-6">
            {/* Información del contrato */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
              <div className="px-6 py-5 bg-slate-900/50 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">📋 Información del Contrato</h3>
              </div>
              <div className="divide-y divide-slate-700">
                <div className="px-6 py-4">
                  <dt className="text-xs text-slate-500 uppercase tracking-wide">Fecha Inicio</dt>
                  <dd className="mt-2 text-sm font-medium text-white">
                    {new Date(settlement.fechaInicioContrato).toLocaleDateString('es-CO')}
                  </dd>
                </div>
                <div className="px-6 py-4">
                  <dt className="text-xs text-slate-500 uppercase tracking-wide">Fecha Fin</dt>
                  <dd className="mt-2 text-sm font-medium text-white">
                    {new Date(settlement.fechaFinContrato).toLocaleDateString('es-CO')}
                  </dd>
                </div>
                <div className="px-6 py-4">
                  <dt className="text-xs text-slate-500 uppercase tracking-wide">Días Trabajados</dt>
                  <dd className="mt-2 text-sm font-medium text-blue-400">
                    {settlement.diasTrabajados} días
                  </dd>
                </div>
                <div className="px-6 py-4">
                  <dt className="text-xs text-slate-500 uppercase tracking-wide">Último Salario</dt>
                  <dd className="mt-2 text-sm font-medium text-white">
                    {formatCurrency(Number(settlement.ultimoSalario))}
                  </dd>
                </div>
                {settlement.promedioSalario && (
                  <div className="px-6 py-4">
                    <dt className="text-xs text-slate-500 uppercase tracking-wide">Promedio Salario (12m)</dt>
                    <dd className="mt-2 text-sm font-medium text-white">
                      {formatCurrency(Number(settlement.promedioSalario))}
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Estado y aprobaciones */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
              <div className="px-6 py-5 bg-slate-900/50 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">✓ Estado y Aprobaciones</h3>
              </div>
              <div className="divide-y divide-slate-700">
                {settlement.aprobadoAt && (
                  <>
                    <div className="px-6 py-4">
                      <dt className="text-xs text-slate-500 uppercase tracking-wide">Aprobado por</dt>
                      <dd className="mt-2 text-sm text-white">
                        {settlement.aprobadoPorUser?.email}
                      </dd>
                    </div>
                    <div className="px-6 py-4">
                      <dt className="text-xs text-slate-500 uppercase tracking-wide">Fecha Aprobación</dt>
                      <dd className="mt-2 text-sm text-green-400 font-medium">
                        {new Date(settlement.aprobadoAt).toLocaleString('es-CO')}
                      </dd>
                    </div>
                    {settlement.comentariosAprobacion && (
                      <div className="px-6 py-4">
                        <dt className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">Comentarios</dt>
                        <dd className="text-sm text-slate-300 bg-slate-900 p-3 rounded border border-slate-600">
                          {settlement.comentariosAprobacion}
                        </dd>
                      </div>
                    )}
                  </>
                )}
                {settlement.rechazadoAt && (
                  <>
                    <div className="px-6 py-4">
                      <dt className="text-xs text-slate-500 uppercase tracking-wide">Rechazado por</dt>
                      <dd className="mt-2 text-sm text-white">
                        {settlement.rechazadoPorUser?.email}
                      </dd>
                    </div>
                    <div className="px-6 py-4">
                      <dt className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">Motivo Rechazo</dt>
                      <dd className="text-sm text-red-300 bg-red-950/30 p-3 rounded border border-red-800">
                        {settlement.motivoRechazo}
                      </dd>
                    </div>
                  </>
                )}
                {settlement.pagadoAt && (
                  <>
                    <div className="px-6 py-4">
                      <dt className="text-xs text-slate-500 uppercase tracking-wide">Fecha Pago</dt>
                      <dd className="mt-2 text-sm text-purple-400 font-medium">
                        {new Date(settlement.pagadoAt).toLocaleString('es-CO')}
                      </dd>
                    </div>
                    <div className="px-6 py-4">
                      <dt className="text-xs text-slate-500 uppercase tracking-wide">Ref. Pago</dt>
                      <dd className="mt-2 text-sm text-white font-mono">
                        {settlement.referenciaPago}
                      </dd>
                    </div>
                  </>
                )}
                {settlement.notas && (
                  <div className="px-6 py-4">
                    <dt className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">Notas</dt>
                    <dd className="text-sm text-slate-300 bg-slate-900 p-3 rounded border border-slate-600">
                      {settlement.notas}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showEditModal && (
        <EditSettlementModal
          settlement={settlement}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleUpdate}
        />
      )}

      {showApproveModal && (
        <ApproveModal
          settlementId={settlement.id}
          onClose={() => setShowApproveModal(false)}
          onSuccess={handleApprove}
        />
      )}

      {showRejectModal && (
        <RejectModal
          settlementId={settlement.id}
          onClose={() => setShowRejectModal(false)}
          onSuccess={handleReject}
        />
      )}

      {showPaidModal && (
        <MarkAsPaidModal
          settlementId={settlement.id}
          onClose={() => setShowPaidModal(false)}
          onSuccess={handleMarkAsPaid}
        />
      )}
    </div>
  );
}
