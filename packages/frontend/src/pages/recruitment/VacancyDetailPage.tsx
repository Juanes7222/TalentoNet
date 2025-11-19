import { useParams, useNavigate, Link } from 'react-router-dom';
import { useVacancy, useCandidates } from '../../hooks/useRecruitment';
import {
  vacancyStatusLabels,
  vacancyStatusColors,
  formatCurrency,
  formatDate,
  candidateStatusLabels,
  candidateStatusColors,
} from '../../utils/recruitment.utils';

export default function VacancyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: vacancy, isLoading } = useVacancy(id!);
  const { data: candidates } = useCandidates({ vacancyId: id });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
        <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mt-0.5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          <div>Vacante no encontrada</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white">{vacancy.cargo}</h1>
              <p className="text-slate-400 mt-1 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M17.504 7.501H7.5v10.003h10.003z"/><path fill="currentColor" d="M21.505 5.5v-2h-2v-2h-2.001v2h-2v-2h-2.001v2h-2v-2H9.501v2h-2v-2H5.5v2h-2v2h-2v2.001h2v2h-2v2.001h2v2h-2v2.001h2v2h2v2.001h2.001v-2h2v2h2.001v-2h2v2h2.001v-2h2v2h2.001v-2h2v-2h2.001v-2.001h-2v-2h2v-2.001h-2v-2h2V9.501h-2v-2h2V5.5zm-2 14.004H5.5V5.501h14.003z"/></svg>
                {vacancy.departamento}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className={`px-4 py-2 rounded-lg font-semibold text-lg ${vacancyStatusColors[vacancy.estado]}`}>
                {vacancyStatusLabels[vacancy.estado]}
              </span>
              <button
                onClick={() => navigate('/recruitment/vacancies')}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200"
              >
                ← Volver
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4 pb-4 border-b border-slate-700">Descripción</h2>
              <p className="text-slate-300 whitespace-pre-line leading-relaxed">{vacancy.descripcion}</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-slate-700">Información General</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Cantidad de Posiciones</p>
                  <p className="text-2xl font-bold text-blue-400">{vacancy.cantidad}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Rango Salarial</p>
                  <p className="text-xl font-bold text-green-400">{formatCurrency(vacancy.salarioMin)} - {formatCurrency(vacancy.salarioMax)}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Fecha de Publicación</p>
                  <p className="font-semibold text-white">{formatDate(vacancy.fechaSolicitud)}</p>
                </div>
                {vacancy.fechaCierre && (
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Fecha de Cierre</p>
                    <p className="font-semibold text-white">{formatDate(vacancy.fechaCierre)}</p>
                  </div>
                )}
                {vacancy.experienciaRequerida && (
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Experiencia Requerida</p>
                    <p className="font-semibold text-white">{vacancy.experienciaRequerida}</p>
                  </div>
                )}
                {vacancy.nivelEducacion && (
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Nivel de Educación</p>
                    <p className="font-semibold text-white">{vacancy.nivelEducacion}</p>
                  </div>
                )}
              </div>
            </div>

            {vacancy.habilidadesRequeridas && vacancy.habilidadesRequeridas.length > 0 && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4 pb-4 border-b border-slate-700">Habilidades Requeridas</h2>
                <div className="flex flex-wrap gap-3">
                  {vacancy.habilidadesRequeridas.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Candidatos */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="currentColor" fillRule="evenodd" clipRule="evenodd"><path d="M11.835 18.666a13.3 13.3 0 0 0-1.817-1.298h.09c.347-.146.668-.349.949-.6c.288-.25.537-.543.738-.868c.37-.623.566-1.333.57-2.057a2.6 2.6 0 0 0 1.517-.27a7 7 0 0 0 2.217-2.096a14 14 0 0 1 1.717-2.107c.84-.45 1.719-.824 2.626-1.118q.372-.194.689-.47c.391-.36.704-.8.918-1.287c.212-.478.32-.995.32-1.518a.32.32 0 0 0-.64 0c-.02.439-.124.87-.309 1.268c-.19.382-.454.722-.779.998a2.4 2.4 0 0 1-.549.34a17.3 17.3 0 0 0-2.795 1.098c-.909.64-1.997 2.566-3.295 3.585a1.77 1.77 0 0 1-2.336.16c-.58-.39-.31-.93 0-1.518c.629-1.129 1.657-2.417 1.717-3.605a2.2 2.2 0 0 0-.72-1.827c-1.277-1.208-2.405-1.148-3.264-.499a5.15 5.15 0 0 0-1.667 3.714c-.12 0-.23-.05-.35-.06a4.5 4.5 0 0 0-1.358.15a5.6 5.6 0 0 1 .18-1.807a19.5 19.5 0 0 1 .899-2.995a4.1 4.1 0 0 1 2.765-2.746a7.2 7.2 0 0 1 2.466-.11c1.348.12 2.746.39 4.044.4h1.308c.999-.06 1.997-.16 2.995-.22a.32.32 0 0 0 0-.64l-2.586.02h-1.697C15.13.614 13.772.255 12.404.096a7.4 7.4 0 0 0-2.825.09A4.99 4.99 0 0 0 6.244 3.57a22.6 22.6 0 0 0-.729 3.235a6.2 6.2 0 0 0-.04 2.167a3.9 3.9 0 0 0-1.368.908a5.14 5.14 0 0 0-1.367 3.195a4.88 4.88 0 0 0 1.597 4.084c-.496.332-.952.72-1.358 1.158a5.6 5.6 0 0 0-.669.949a6.6 6.6 0 0 0-.47 1.048a11.8 11.8 0 0 0-.548 2.566a.32.32 0 1 0 .629.12c.216-.79.503-1.559.858-2.297c.15-.31.31-.599.48-.898s.35-.57.539-.859a10.3 10.3 0 0 1 1.138-1.408a4.1 4.1 0 0 0 1.657.5a.32.32 0 0 0 .38-.28a.33.33 0 0 0-.29-.36c-1.747-.26-3.095-1.927-2.855-4.263a4.16 4.16 0 0 1 1.507-2.905a3.35 3.35 0 0 1 2.067-.7a7.7 7.7 0 0 1 1.827.27a4.1 4.1 0 0 1 1.388.86a3.7 3.7 0 0 0-.26.648a1.66 1.66 0 0 0 .72 1.997q.299.207.638.34c-.14.92-.63 1.75-1.367 2.316a6 6 0 0 1-.71.509a6 6 0 0 1-1.996.749a.28.28 0 0 0-.26.3a.28.28 0 0 0 .3.269a6.5 6.5 0 0 0 1.567-.13q.998.858 1.897 1.817q.658.658 1.208 1.408a4.13 4.13 0 0 1 .999 2.746a.32.32 0 0 0 .27.37a.33.33 0 0 0 .369-.28a4.57 4.57 0 0 0-.749-3.435a7.7 7.7 0 0 0-1.408-1.618M9.46 9.13a6 6 0 0 0-1.138-.359a4.34 4.34 0 0 1 1.517-3.185c.61-.4 1.358-.32 2.187.54c.829.858.38 1.527-.08 2.326c-.33.569-.729 1.148-1.068 1.687A4.8 4.8 0 0 0 9.459 9.13"/><path d="M22.219 20.642a6 6 0 0 0-.41-.908a4.5 4.5 0 0 0-.579-.819a5.7 5.7 0 0 0-1.078-.958q.305-.223.55-.51a4.18 4.18 0 0 0 .548-3.864a4.33 4.33 0 0 0-2.865-2.496a.28.28 0 0 0-.36.17a.28.28 0 0 0 .17.37a3.64 3.64 0 0 1 2.197 2.336c.105.397.135.81.09 1.218a3.6 3.6 0 0 1-.67 1.717a2.7 2.7 0 0 1-.918.69c-.54.31-1.154.472-1.777.468a3.76 3.76 0 0 1-2.756-1.497a.32.32 0 0 0-.449-.05a.33.33 0 0 0 0 .46a4.47 4.47 0 0 0 3.205 1.996c.85.06 1.7-.127 2.446-.54q.495.545.899 1.16q.24.358.449.718c.15.25.28.5.41.759q.465.965.758 1.997a.32.32 0 0 0 .38.25a.32.32 0 0 0 .25-.255a.3.3 0 0 0 0-.125a10 10 0 0 0-.49-2.287"/></g></svg>
                  Candidatos ({candidates?.length || 0})
                </h2>
                <Link
                  to="/recruitment/candidates"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                >
                  Ver todos →
                </Link>
              </div>

              {candidates && candidates.length > 0 ? (
                <div className="space-y-3">
                  {candidates.slice(0, 5).map((candidate) => (
                    <Link
                      key={candidate.id}
                      to={`/recruitment/candidates/${candidate.id}`}
                      className="block bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">
                            {candidate.nombre} {candidate.apellido}
                          </p>
                          <p className="text-sm text-slate-400">{candidate.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${candidateStatusColors[candidate.estadoProceso]}`}>
                          {candidateStatusLabels[candidate.estadoProceso]}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {candidates.length > 5 && (
                    <div className="text-center pt-2">
                      <Link
                        to={`/recruitment/candidates?vacancyId=${id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                      >
                        Ver {candidates.length - 5} candidatos más →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500">No hay candidatos postulados aún</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 pb-4 border-b border-slate-700">Estadísticas</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                  <span className="text-slate-400">Total Candidatos</span>
                  <span className="text-3xl font-bold text-blue-400">
                    {candidates?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                  <span className="text-slate-400">Posiciones</span>
                  <span className="text-3xl font-bold text-green-400">
                    {vacancy.cantidad}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 pb-4 border-b border-slate-700">Acciones</h2>
              <div className="space-y-3">
                <Link
                  to={`/recruitment/vacancies/${id}/edit`}
                  className="block w-full px-4 py-3 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 21v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM17.6 7.8L19 6.4L17.6 5l-1.4 1.4z"/></svg>
                  Editar Vacante
                </Link>
                <Link
                  to="/recruitment/candidates/new"
                  state={{ vacancyId: id }}
                  className="block w-full px-4 py-3 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  Agregar Candidato
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
