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

  if (loading || !settlement) {
    return <div className="p-6">Cargando liquidación...</div>;
  }

  const detalleCalculo = settlement.detalleJson?.calculoAutomatico || {};
  const advertencias = settlement.detalleJson?.advertencias || [];
  const ajustesManuales = settlement.detalleJson?.ajustesManuales || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/settlements')}
          className="text-indigo-600 hover:text-indigo-800 mb-2 inline-flex items-center"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a liquidaciones
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Liquidación de Contrato
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {settlement.employee?.firstName} {settlement.employee?.lastName} - {settlement.contract?.position}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoBadgeColor(settlement.estado)}`}>
              {getEstadoLabel(settlement.estado)}
            </span>

            {/* Acciones según estado */}
            {canEdit(settlement) && (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Editar Valores
              </button>
            )}

            {canApprove(settlement) && (
              <button
                onClick={() => setShowApproveModal(true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Aprobar
              </button>
            )}

            {canReject(settlement) && (
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Rechazar
              </button>
            )}

            {canMarkAsPaid(settlement) && (
              <button
                onClick={() => setShowPaidModal(true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Marcar como Pagada
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advertencias */}
      {advertencias.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Advertencias</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  {advertencias.map((adv: string, idx: number) => (
                    <li key={idx}>{adv}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal - Desglose */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resumen de conceptos */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Desglose de Liquidación</h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Cesantías</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between">
                    <span>{formatCurrency(Number(settlement.cesantias))}</span>
                    {detalleCalculo.cesantias && (
                      <span className="text-xs text-gray-500">{detalleCalculo.cesantias.formula}</span>
                    )}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Intereses sobre Cesantías</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between">
                    <span>{formatCurrency(Number(settlement.interesesCesantias))}</span>
                    {detalleCalculo.intereses && (
                      <span className="text-xs text-gray-500">{detalleCalculo.intereses.formula}</span>
                    )}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Prima de Servicios</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between">
                    <span>{formatCurrency(Number(settlement.primaServicios))}</span>
                    {detalleCalculo.prima && (
                      <span className="text-xs text-gray-500">{detalleCalculo.prima.formula}</span>
                    )}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Vacaciones</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between">
                    <span>{formatCurrency(Number(settlement.vacaciones))}</span>
                    {detalleCalculo.vacaciones && (
                      <span className="text-xs text-gray-500">{detalleCalculo.vacaciones.formula}</span>
                    )}
                  </dd>
                </div>
                {Number(settlement.indemnizacion) > 0 && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Indemnización
                      {settlement.tipoIndemnizacion && (
                        <div className="text-xs text-gray-400 mt-1">
                          ({settlement.tipoIndemnizacion.replace('_', ' ')})
                        </div>
                      )}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between">
                      <span>{formatCurrency(Number(settlement.indemnizacion))}</span>
                      {detalleCalculo.indemnizacion && (
                        <span className="text-xs text-gray-500">{detalleCalculo.indemnizacion.formula}</span>
                      )}
                    </dd>
                  </div>
                )}
                {Number(settlement.otrosConceptos) > 0 && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Otros Conceptos</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatCurrency(Number(settlement.otrosConceptos))}
                    </dd>
                  </div>
                )}
                {Number(settlement.deducciones) > 0 && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Deducciones</dt>
                    <dd className="mt-1 text-sm text-red-600 sm:mt-0 sm:col-span-2">
                      - {formatCurrency(Number(settlement.deducciones))}
                    </dd>
                  </div>
                )}
                <div className="bg-indigo-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t-2 border-indigo-200">
                  <dt className="text-lg font-bold text-indigo-900">TOTAL A PAGAR</dt>
                  <dd className="mt-1 text-2xl font-bold text-indigo-600 sm:mt-0 sm:col-span-2">
                    {formatCurrency(Number(settlement.totalLiquidacion))}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Ajustes manuales */}
          {ajustesManuales.length > 0 && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Historial de Ajustes Manuales</h3>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {ajustesManuales.map((ajuste: any, idx: number) => (
                    <li key={idx} className="px-4 py-4">
                      <div className="flex justify-between">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {new Date(ajuste.fecha).toLocaleString('es-CO')}
                          </div>
                          <div className="text-gray-500 mt-1">
                            {ajuste.cambios.map((c: any, i: number) => (
                              <div key={i}>
                                <strong>{c.campo}:</strong> {formatCurrency(c.anterior)} → {formatCurrency(c.nuevo)}
                              </div>
                            ))}
                          </div>
                          {ajuste.justificacion && (
                            <div className="text-gray-600 mt-2 italic">
                              Justificación: {ajuste.justificacion}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Columna lateral - Info adicional */}
        <div className="space-y-6">
          {/* Información del contrato */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Información del Contrato</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Fecha Inicio</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(settlement.fechaInicioContrato).toLocaleDateString('es-CO')}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Fecha Fin</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(settlement.fechaFinContrato).toLocaleDateString('es-CO')}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Días Trabajados</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {settlement.diasTrabajados} días
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Último Salario</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatCurrency(Number(settlement.ultimoSalario))}
                  </dd>
                </div>
                {settlement.promedioSalario && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Promedio Salario (12m)</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatCurrency(Number(settlement.promedioSalario))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Estado y aprobaciones */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Estado y Aprobaciones</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                {settlement.aprobadoAt && (
                  <>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Aprobado por</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {settlement.aprobadoPorUser?.email}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Fecha Aprobación</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(settlement.aprobadoAt).toLocaleString('es-CO')}
                      </dd>
                    </div>
                    {settlement.comentariosAprobacion && (
                      <div className="py-4 sm:py-5 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 mb-2">Comentarios</dt>
                        <dd className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                          {settlement.comentariosAprobacion}
                        </dd>
                      </div>
                    )}
                  </>
                )}
                {settlement.rechazadoAt && (
                  <>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Rechazado por</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {settlement.rechazadoPorUser?.email}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500 mb-2">Motivo Rechazo</dt>
                      <dd className="text-sm text-red-600 bg-red-50 p-3 rounded">
                        {settlement.motivoRechazo}
                      </dd>
                    </div>
                  </>
                )}
                {settlement.pagadoAt && (
                  <>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Fecha Pago</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(settlement.pagadoAt).toLocaleString('es-CO')}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Ref. Pago</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {settlement.referenciaPago}
                      </dd>
                    </div>
                  </>
                )}
                {settlement.notas && (
                  <div className="py-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 mb-2">Notas</dt>
                    <dd className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                      {settlement.notas}
                    </dd>
                  </div>
                )}
              </dl>
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
