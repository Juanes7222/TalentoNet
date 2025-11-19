import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useAffiliation,
  useAffiliationLogs,
  useRetireAffiliation,
  useUpdateDocument,
} from '../../hooks/useAffiliations';
import { AffiliationStatus } from '../../types/affiliations';
import {
  affiliationTypeLabels,
  affiliationStatusLabels,
  affiliationTypeColors,
  affiliationStatusColors,
  formatDate,
  formatDateTime,
  logActionLabels,
  getAffiliationTypeIcon,
} from '../../utils/affiliations.utils';

export default function AffiliationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: affiliation, isLoading } = useAffiliation(id!);
  const { data: logs } = useAffiliationLogs(id!);
  const retireMutation = useRetireAffiliation();
  const updateDocMutation = useUpdateDocument();

  const [showRetireModal, setShowRetireModal] = useState(false);
  const [retireComment, setRetireComment] = useState('');
  const [newDocument, setNewDocument] = useState<File | null>(null);

  const handleRetire = async () => {
    if (!id) return;
    try {
      await retireMutation.mutateAsync({
        id,
        data: { comentario: retireComment },
      });
      setShowRetireModal(false);
      alert('Afiliación retirada exitosamente');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdateDocument = async () => {
    if (!id || !newDocument) return;
    try {
      await updateDocMutation.mutateAsync({ id, file: newDocument });
      setNewDocument(null);
      alert('Comprobante actualizado exitosamente');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  if (!affiliation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
        <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
          ⚠️ Afiliación no encontrada
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <span className="text-6xl">{getAffiliationTypeIcon(affiliation.tipo)}</span>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {affiliation.proveedor}
                </h1>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded-full border border-blue-500/30">
                    {affiliationTypeLabels[affiliation.tipo]}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                    affiliation.estado === AffiliationStatus.ACTIVO
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {affiliationStatusLabels[affiliation.estado]}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition duration-200"
              >
                ← Volver
              </button>
              {affiliation.estado === AffiliationStatus.ACTIVO && (
                <button
                  onClick={() => setShowRetireModal(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-200 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-7 4h10"/></svg>
                  Retirar Afiliación
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Información principal */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-slate-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/> <line x1="12" y1="16" x2="12" y2="12"/> <line x1="12" y1="8" x2="12" y2="8"/></svg>
                Información General
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Empleado</p>
                  <p className="font-semibold text-white">
                    {affiliation.employee
                      ? `${affiliation.employee.firstName} ${affiliation.employee.lastName}`
                      : 'N/A'}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    CC: {affiliation.employee?.identificationNumber}
                  </p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Fecha de Afiliación</p>
                  <p className="font-semibold text-white">{formatDate(affiliation.fechaAfiliacion)}</p>
                </div>
                {affiliation.fechaRetiro && (
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Fecha de Retiro</p>
                    <p className="font-semibold text-red-400">{formatDate(affiliation.fechaRetiro)}</p>
                  </div>
                )}
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Consentimiento ARCO</p>
                  <p className="font-semibold">
                    {affiliation.consentimientoArco ? (
                      <span className="text-green-400">✓ Otorgado</span>
                    ) : (
                      <span className="text-red-400">✗ No otorgado</span>
                    )}
                  </p>
                  {affiliation.fechaConsentimiento && (
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(affiliation.fechaConsentimiento)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Comprobante */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-slate-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 8h16"/></svg>
                Comprobante
              </h2>
              {affiliation.comprobanteFilename ? (
                <div className="space-y-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <p className="font-semibold text-white mb-2">📄 {affiliation.comprobanteFilename}</p>
                    {affiliation.comprobanteUrl && (
                      <a href={affiliation.comprobanteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"/></svg>
                        Ver documento
                      </a>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Actualizar Comprobante (PDF)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setNewDocument(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                    {newDocument && (
                      <button
                        onClick={handleUpdateDocument}
                        disabled={updateDocMutation.isPending}
                        className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-medium rounded-lg transition duration-200"
                      >
                        {updateDocMutation.isPending ? '⏳ Actualizando...' : '✓ Actualizar'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400">No hay comprobante adjunto</p>
              )}
            </div>

            {/* Historial */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-slate-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-4h2v18h-2z"/></svg>
                  Historial de Cambios
              </h2>
              {logs && logs.length > 0 ? (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="border-l-4 border-blue-500 pl-4 py-3 bg-slate-900/50 rounded"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-white">{logActionLabels[log.accion]}</span>
                        <span className="text-xs text-slate-400">
                          {formatDateTime(log.fecha)}
                        </span>
                      </div>
                      {log.detalle && <p className="text-sm text-slate-300 mt-2">{log.detalle}</p>}
                      {log.usuario && (
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21h13a2.5 2.5 0 0 0-2.5-2.5h-8a2.5 2.5 0 0 0-2.5 2.5z"/> </svg>
                          Por: {log.usuario.email}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-6">No hay historial disponible</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 border border-blue-700 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 20 20"><path fill="currentColor" d="M18 7.121V13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11.879l-1 1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.121zM4 8.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m0 3a.5.5 0 0 1 .5-.5H9a.5.5 0 0 1 0 1H4.5a.5.5 0 0 1-.5-.5m13.854-6.354a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708l6-6a.5.5 0 0 1 .708 0"/></svg>
                Resumen
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-blue-200">Número Afiliación</p>
                  <p className="font-semibold text-white">{affiliation.numeroAfiliacion}</p>
                </div>
                <div>
                  <p className="text-blue-200">Código Proveedor</p>
                  <p className="font-semibold text-white">{affiliation.codigoProveedor || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-blue-200">Estado Actual</p>
                  <p className="font-semibold text-white">
                    {affiliationStatusLabels[affiliation.estado]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de retiro */}
        {showRetireModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-2xl max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-7 4h10"/></svg>
                Retirar Afiliación</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Comentario (opcional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                    rows={4}
                    placeholder="Ingrese comentario sobre el retiro..."
                    value={retireComment}
                    onChange={(e) => setRetireComment(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleRetire}
                  disabled={retireMutation.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
                >
                  {retireMutation.isPending ? '⏳ Retirando...' : '✓ Confirmar Retiro'}
                </button>
                <button
                  onClick={() => setShowRetireModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
