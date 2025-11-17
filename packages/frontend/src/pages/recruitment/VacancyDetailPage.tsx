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
        <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
          ⚠️ Vacante no encontrada
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
              <p className="text-slate-400 mt-1">📍 {vacancy.departamento}</p>
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
                <h2 className="text-2xl font-bold text-white">
                  👥 Candidatos ({candidates?.length || 0})
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
                  className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-200 text-center"
                >
                  ✏️ Editar Vacante
                </Link>
                <Link
                  to="/recruitment/candidates/new"
                  state={{ vacancyId: id }}
                  className="block w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200 text-center"
                >
                  ➕ Agregar Candidato
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
