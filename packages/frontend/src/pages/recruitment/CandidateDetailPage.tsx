import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useCandidate,
  useCandidateStateHistory,
  useUpdateCandidateStatus,
  useInterviews,
  useCreateInterview,
} from '../../hooks/useRecruitment';
import { CandidateStatus, InterviewType, InterviewStatus } from '../../types/recruitment';
import {
  candidateStatusLabels,
  candidateStatusColors,
  formatDate,
  formatDateTime,
  interviewTypeLabels,
  interviewResultLabels,
  interviewResultColors,
} from '../../utils/recruitment.utils';

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: candidate, isLoading } = useCandidate(id!);
  const { data: history } = useCandidateStateHistory(id!);
  const { data: interviews } = useInterviews(id);
  const updateStatus = useUpdateCandidateStatus();
  const createInterview = useCreateInterview();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [newStatus, setNewStatus] = useState<CandidateStatus>(CandidateStatus.POSTULADO);
  const [statusComment, setStatusComment] = useState('');
  const [interviewData, setInterviewData] = useState({
    tipo: InterviewType.PRESENCIAL,
    fecha: '',
  });

  const handleStatusChange = async () => {
    try {
      await updateStatus.mutateAsync({
        id: id!,
        data: {
          estado: newStatus,
          comentario: statusComment,
        },
      });
      setShowStatusModal(false);
      setStatusComment('');
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const handleScheduleInterview = async () => {
    try {
      await createInterview.mutateAsync({
        candidateId: id!,
        tipo: interviewData.tipo,
        fecha: interviewData.fecha,
        estado: InterviewStatus.PROGRAMADA,
      });
      setShowInterviewModal(false);
      setInterviewData({
        tipo: InterviewType.PRESENCIAL,
        fecha: '',
      });
    } catch (error) {
      console.error('Error al programar entrevista:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando información del candidato...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Candidato no encontrado
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {candidate.nombre} {candidate.apellido}
          </h1>
          <p className="text-gray-600 mt-1">{candidate.email}</p>
        </div>
        <span className={`badge text-lg ${candidateStatusColors[candidate.estadoProceso]}`}>
          {candidateStatusLabels[candidate.estadoProceso]}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Cédula</p>
                <p className="font-medium">{candidate.cedula}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-medium">{candidate.telefono}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                <p className="font-medium">{formatDate(candidate.fechaNacimiento)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Postulación</p>
                <p className="font-medium">{formatDate(candidate.fechaPostulacion)}</p>
              </div>
              {candidate.ciudad && (
                <div>
                  <p className="text-sm text-gray-600">Ciudad</p>
                  <p className="font-medium">{candidate.ciudad}</p>
                </div>
              )}
              {candidate.departamento && (
                <div>
                  <p className="text-sm text-gray-600">Departamento</p>
                  <p className="font-medium">{candidate.departamento}</p>
                </div>
              )}
              {candidate.direccion && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Dirección</p>
                  <p className="font-medium">{candidate.direccion}</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Información Laboral</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Experiencia</p>
                <p className="font-medium">{candidate.experienciaAnios || 0} años</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Último Cargo</p>
                <p className="font-medium">{candidate.ultimoCargo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Última Empresa</p>
                <p className="font-medium">{candidate.ultimaEmpresa || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nivel de Educación</p>
                <p className="font-medium">{candidate.nivelEducacion || 'N/A'}</p>
              </div>
            </div>
          </div>

          {candidate.notas && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Notas</h2>
              <p className="text-gray-700">{candidate.notas}</p>
            </div>
          )}

          {/* Entrevistas */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Entrevistas</h2>
              <button
                onClick={() => setShowInterviewModal(true)}
                className="btn btn-primary"
              >
                + Programar Entrevista
              </button>
            </div>

            {interviews && interviews.length > 0 ? (
              <div className="space-y-3">
                {interviews.map((interview) => (
                  <div key={interview.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {interviewTypeLabels[interview.tipo]}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDateTime(interview.fecha)}
                        </p>
                      </div>
                      {interview.resultado && (
                        <span className={`badge ${interviewResultColors[interview.resultado]}`}>
                          {interviewResultLabels[interview.resultado]}
                        </span>
                      )}
                    </div>
                    {interview.notas && (
                      <p className="text-sm text-gray-700 mt-2">{interview.notas}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay entrevistas programadas</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Acciones</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowStatusModal(true)}
                className="btn btn-primary w-full"
              >
                Cambiar Estado
              </button>
              <button
                onClick={() => navigate(`/recruitment/vacancies/${candidate.vacancyId}`)}
                className="btn btn-secondary w-full"
              >
                Ver Vacante
              </button>
            </div>
          </div>

          {/* Historial de Estados */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Historial de Estados</h2>
            {history && history.length > 0 ? (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.id} className="border-l-4 border-primary-500 pl-3">
                    <div className="flex gap-2 items-start">
                      <span className="text-sm text-gray-600">
                        {candidateStatusLabels[entry.estadoAnterior as CandidateStatus]}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="text-sm font-medium">
                        {candidateStatusLabels[entry.estadoNuevo as CandidateStatus]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(entry.fecha)}
                    </p>
                    {entry.comentario && (
                      <p className="text-sm text-gray-700 mt-1">{entry.comentario}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Sin cambios registrados</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Cambiar Estado */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Cambiar Estado del Candidato</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo Estado
                </label>
                <select
                  className="input"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as CandidateStatus)}
                >
                  {Object.entries(candidateStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentario (opcional)
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleStatusChange}
                className="btn btn-primary flex-1"
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Programar Entrevista */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Programar Entrevista</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Entrevista
                </label>
                <select
                  className="input"
                  value={interviewData.tipo}
                  onChange={(e) =>
                    setInterviewData({ ...interviewData, tipo: e.target.value as InterviewType })
                  }
                >
                  {Object.entries(interviewTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y Hora
                </label>
                <input
                  type="datetime-local"
                  className="input"
                  value={interviewData.fecha}
                  onChange={(e) => setInterviewData({ ...interviewData, fecha: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleScheduleInterview}
                className="btn btn-primary flex-1"
                disabled={createInterview.isPending}
              >
                {createInterview.isPending ? 'Programando...' : 'Programar'}
              </button>
              <button
                onClick={() => setShowInterviewModal(false)}
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
