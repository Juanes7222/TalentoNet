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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
        <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
          ⚠️ Candidato no encontrado
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
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {candidate.nombre} {candidate.apellido}
              </h1>
              <p className="text-slate-400 text-lg">{candidate.email}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                candidate.estadoProceso === CandidateStatus.CONTRATADO
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : candidate.estadoProceso === CandidateStatus.RECHAZADO
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {candidateStatusLabels[candidate.estadoProceso]}
              </span>
              <button
                onClick={() => navigate('/recruitment/candidates')}
                className="text-slate-400 hover:text-white transition"
              >
                ← Volver
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Información Personal */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-slate-700">
                👤 Información Personal
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Cédula</p>
                  <p className="font-semibold text-white">{candidate.cedula}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Teléfono</p>
                  <p className="font-semibold text-white">{candidate.telefono}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Fecha de Nacimiento</p>
                  <p className="font-semibold text-white">{formatDate(candidate.fechaNacimiento)}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Fecha de Postulación</p>
                  <p className="font-semibold text-white">{formatDate(candidate.fechaPostulacion)}</p>
                </div>
                {candidate.ciudad && (
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Ciudad</p>
                    <p className="font-semibold text-white">{candidate.ciudad}</p>
                  </div>
                )}
                {candidate.departamento && (
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Departamento</p>
                    <p className="font-semibold text-white">{candidate.departamento}</p>
                  </div>
                )}
                {candidate.direccion && (
                  <div className="md:col-span-2 bg-slate-900/50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Dirección</p>
                    <p className="font-semibold text-white">{candidate.direccion}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información Laboral */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-slate-700">
                💼 Información Laboral
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Experiencia</p>
                  <p className="font-semibold text-white">{candidate.experienciaAnios || 0} años</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Último Cargo</p>
                  <p className="font-semibold text-white">{candidate.ultimoCargo || 'N/A'}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Última Empresa</p>
                  <p className="font-semibold text-white">{candidate.ultimaEmpresa || 'N/A'}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Nivel de Educación</p>
                  <p className="font-semibold text-white">{candidate.nivelEducacion || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Notas */}
            {candidate.notas && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4 pb-4 border-b border-slate-700">
                  📝 Notas
                </h2>
                <p className="text-slate-300">{candidate.notas}</p>
              </div>
            )}

            {/* Entrevistas */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">🎤 Entrevistas</h2>
                <button
                  onClick={() => setShowInterviewModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
                >
                  + Programar
                </button>
              </div>

              {interviews && interviews.length > 0 ? (
                <div className="space-y-4">
                  {interviews.map((interview) => (
                    <div key={interview.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="font-semibold text-white text-lg">
                            {interviewTypeLabels[interview.tipo]}
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                            📅 {formatDateTime(interview.fecha)}
                          </p>
                        </div>
                        {interview.resultado && (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            interview.resultado === 'aprobado'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {interviewResultLabels[interview.resultado]}
                          </span>
                        )}
                      </div>
                      {interview.notas && (
                        <p className="text-sm text-slate-300 mt-3 bg-slate-800 p-3 rounded border border-slate-700">
                          {interview.notas}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">No hay entrevistas programadas</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Acciones */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 pb-3 border-b border-slate-700">
                ⚡ Acciones
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
                >
                  🔄 Cambiar Estado
                </button>
                <button
                  onClick={() => navigate(`/recruitment/vacancies/${candidate.vacancyId}`)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
                >
                  📋 Ver Vacante
                </button>
              </div>
            </div>

            {/* Historial de Estados */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 pb-3 border-b border-slate-700">
                📊 Historial de Estados
              </h2>
              {history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div key={entry.id} className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-slate-400">
                          {candidateStatusLabels[entry.estadoAnterior as CandidateStatus]}
                        </span>
                        <span className="text-slate-600">→</span>
                        <span className="text-xs font-bold text-blue-400">
                          {candidateStatusLabels[entry.estadoNuevo as CandidateStatus]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(entry.fecha)}
                      </p>
                      {entry.comentario && (
                        <p className="text-xs text-slate-300 mt-2 bg-slate-800 p-2 rounded border border-slate-700">
                          {entry.comentario}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-4">Sin cambios registrados</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Cambiar Estado */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-2xl max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-6">🔄 Cambiar Estado</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Nuevo Estado *
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
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
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Comentario (opcional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    rows={3}
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    placeholder="Ingrese un comentario..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleStatusChange}
                  disabled={updateStatus.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
                >
                  {updateStatus.isPending ? '⏳ Guardando...' : '✓ Guardar'}
                </button>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Programar Entrevista */}
        {showInterviewModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-2xl max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-6">🎤 Programar Entrevista</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Tipo de Entrevista *
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
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
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Fecha y Hora *
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    value={interviewData.fecha}
                    onChange={(e) => setInterviewData({ ...interviewData, fecha: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleScheduleInterview}
                  disabled={createInterview.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
                >
                  {createInterview.isPending ? '⏳ Programando...' : '✓ Programar'}
                </button>
                <button
                  onClick={() => setShowInterviewModal(false)}
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
