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
        <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          <span>Candidato no encontrado</span>
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
              <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-slate-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Información Personal
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
              <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-slate-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 22v-3c0-1.886 0-2.828-.586-3.414S17.886 15 16 15h-2l-2 2l-2-2H8c-1.886 0-2.828 0-3.414.586S4 17.114 4 19v3m12-7v7m-8-7v7m7.5-13V7a3.5 3.5 0 1 0-7 0v2a3.5 3.5 0 1 0 7 0m-8-1.5h9M12 2v1.5"/></svg>
                Información Laboral
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
                <h2 className="text-2xl font-bold text-white mb-4 pb-4 border-b border-slate-700 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M.75 12h3m-3 6h3m-3-12h3m0-5.25H17.5s1.5 0 1.5 1.5v19.5s0 1.5-1.5 1.5H3.75s-1.5 0-1.5-1.5V2.25s0-1.5 1.5-1.5"/><path d="M8.25 5.25h5.25s1.5 0 1.5 1.5V9s0 1.5-1.5 1.5H8.25s-1.5 0-1.5-1.5V6.75s0-1.5 1.5-1.5M19 16.75h2.75a1.5 1.5 0 0 0 1.5-1.5V3.75a1.5 1.5 0 0 0-1.5-1.5H19zM19 7h4.25M19 12h4.25"/></g></svg>
                  Notas
                </h2>
                <p className="text-slate-300">{candidate.notas}</p>
              </div>
            )}

            {/* Entrevistas */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" d="M5 13.5h14m-7 0V24M6.5 11V6.5H5.328a3 3 0 0 0-2.906 2.255L.5 16.25v.25h7V18c0 1.5 0 2.5.75 4c0 0 .75 1.5 1.75 1.5M17.5 11V6.5h1.172a3 3 0 0 1 2.906 2.255L23.5 16.25v.25h-7V18c0 1.5 0 2.5-.75 4c0 0-.75 1.5-1.75 1.5m-7.65-19s-1.6-1-1.6-2.25a1.747 1.747 0 1 1 3.496 0C8.246 3.5 6.65 4.5 6.65 4.5zm11.3 0s1.6-1 1.6-2.25A1.75 1.75 0 0 0 17.5.5c-.966 0-1.746.784-1.746 1.75c0 1.25 1.596 2.25 1.596 2.25z" strokeWidth="1"/>
                  </svg>
                  Entrevistas
                </h2>
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
                          <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                            </svg>
                            {formatDateTime(interview.fecha)}
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
              <h2 className="text-xl font-bold text-white mb-4 pb-3 border-b border-slate-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 2048 2048" fill="currentColor"> <path d="M1664 0v128H0V0zm-649 512l-67 128H0V512zM0 1024h747l-67 128H0zm1512 0h568L1004 2048H747l304-640H691l535-1024h612zm-559 896l807-768h-456l325-640h-325l-402 768h351l-304 640z"/></svg>
                Acciones
              </h2>
              <div className="space-y-3">
                <button onClick={() => setShowStatusModal(true)} className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" > <path d="M18 31h20V5" /> <path d="M30 21H10v22m34-32l-6-6l-6 6" /><path d="m16 37l-6 6l-6-6" /></svg>
                  Cambiar Estado
                </button>
                <button
                  onClick={() => navigate(`/recruitment/vacancies/${candidate.vacancyId}`)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg inline-flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  Ver Vacante
                </button>
              </div>
            </div>

            {/* Historial de Estados */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 pb-3 border-b border-slate-700 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-4h2v18h-2z"/>
                </svg>
                Historial de Estados
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
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" > <path d="M18 31h20V5" /> <path d="M30 21H10v22m34-32l-6-6l-6 6" /><path d="m16 37l-6 6l-6-6" /></svg>
                  Cambiar Estado</h3>
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg inline-flex items-center justify-center gap-2"
                >
                  {updateStatus.isPending ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4m8-8h-4M4 12H0"/></svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21q-1.875 0-3.512-.712t-2.85-1.925t-1.925-2.85T3 12t.713-3.512t1.924-2.85t2.85-1.925T12 3q2.05 0 3.888.875T19 6.35V4h2v6h-6V8h2.75q-1.025-1.4-2.525-2.2T12 5Q9.075 5 7.038 7.038T5 12t2.038 4.963T12 19q2.625 0 4.588-1.7T18.9 13h2.05q-.375 3.425-2.937 5.713T12 21m2.8-4.8L11 12.4V7h2v4.6l3.2 3.2z"/></svg>
                      Guardar
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg inline-flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  Cancelar
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg inline-flex items-center justify-center gap-2"
                >
                  {createInterview.isPending ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4m8-8h-4M4 12H0"/></svg>
                      Programando...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21q-1.875 0-3.512-.712t-2.85-1.925t-1.925-2.85T3 12t.713-3.512t1.924-2.85t2.85-1.925T12 3q2.05 0 3.888.875T19 6.35V4h2v6h-6V8h2.75q-1.025-1.4-2.525-2.2T12 5Q9.075 5 7.038 7.038T5 12t2.038 4.963T12 19q2.625 0 4.588-1.7T18.9 13h2.05q-.375 3.425-2.937 5.713T12 21m2.8-4.8L11 12.4V7h2v4.6l3.2 3.2z"/></svg>
                      Programar
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowInterviewModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg inline-flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
