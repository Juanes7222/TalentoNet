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
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!affiliation) {
    return <div className="text-center py-12">Afiliación no encontrada</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{getAffiliationTypeIcon(affiliation.tipo)}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {affiliation.proveedor}
              </h1>
              <div className="flex gap-2 mt-2">
                <span className={`badge ${affiliationTypeColors[affiliation.tipo]}`}>
                  {affiliationTypeLabels[affiliation.tipo]}
                </span>
                <span className={`badge ${affiliationStatusColors[affiliation.estado]}`}>
                  {affiliationStatusLabels[affiliation.estado]}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Volver
          </button>
          {affiliation.estado === AffiliationStatus.ACTIVO && (
            <button
              onClick={() => setShowRetireModal(true)}
              className="btn btn-danger"
            >
              Retirar Afiliación
            </button>
          )}
        </div>
      </div>

      {/* Información principal */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Información General</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Empleado</p>
            <p className="font-medium">
              {affiliation.employee
                ? `${affiliation.employee.firstName} ${affiliation.employee.lastName}`
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              CC: {affiliation.employee?.identificationNumber}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha de Afiliación</p>
            <p className="font-medium">{formatDate(affiliation.fechaAfiliacion)}</p>
          </div>
          {affiliation.fechaRetiro && (
            <div>
              <p className="text-sm text-gray-500">Fecha de Retiro</p>
              <p className="font-medium">{formatDate(affiliation.fechaRetiro)}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Consentimiento ARCO</p>
            <p className="font-medium">
              {affiliation.consentimientoArco ? (
                <span className="text-green-600">✓ Otorgado</span>
              ) : (
                <span className="text-red-600">✗ No otorgado</span>
              )}
            </p>
            {affiliation.fechaConsentimiento && (
              <p className="text-xs text-gray-500">
                {formatDate(affiliation.fechaConsentimiento)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Comprobante */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Comprobante</h2>
        {affiliation.comprobanteFilename ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">📄 {affiliation.comprobanteFilename}</p>
              {affiliation.comprobanteUrl && (
                <a
                  href={affiliation.comprobanteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ver documento
                </a>
              )}
            </div>
            <div>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setNewDocument(e.target.files?.[0] || null)}
                className="text-sm"
              />
              {newDocument && (
                <button
                  onClick={handleUpdateDocument}
                  className="btn btn-sm btn-primary mt-2"
                  disabled={updateDocMutation.isPending}
                >
                  {updateDocMutation.isPending ? 'Actualizando...' : 'Actualizar'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No hay comprobante adjunto</p>
        )}
      </div>

      {/* Historial */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Historial de Cambios</h2>
        {logs && logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{logActionLabels[log.accion]}</span>
                  <span className="text-sm text-gray-500">
                    {formatDateTime(log.fecha)}
                  </span>
                </div>
                {log.detalle && <p className="text-sm text-gray-600 mt-1">{log.detalle}</p>}
                {log.usuario && (
                  <p className="text-xs text-gray-500 mt-1">
                    Por: {log.usuario.email}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay historial disponible</p>
        )}
      </div>

      {/* Modal de retiro */}
      {showRetireModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Retirar Afiliación</h3>
            <textarea
              className="input w-full"
              rows={4}
              placeholder="Comentario sobre el retiro (opcional)"
              value={retireComment}
              onChange={(e) => setRetireComment(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleRetire}
                className="btn btn-danger flex-1"
                disabled={retireMutation.isPending}
              >
                {retireMutation.isPending ? 'Retirando...' : 'Confirmar Retiro'}
              </button>
              <button
                onClick={() => setShowRetireModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
