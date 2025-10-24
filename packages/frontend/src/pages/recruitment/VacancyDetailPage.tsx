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
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando detalles de la vacante...</div>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Vacante no encontrada
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{vacancy.cargo}</h1>
          <p className="text-gray-600 mt-1">{vacancy.departamento}</p>
        </div>
        <div className="flex gap-3 items-center">
          <span className={`badge text-lg ${vacancyStatusColors[vacancy.estado]}`}>
            {vacancyStatusLabels[vacancy.estado]}
          </span>
          <button
            onClick={() => navigate('/recruitment/vacancies')}
            className="btn btn-secondary"
          >
            ← Volver
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Descripción</h2>
            <p className="text-gray-700 whitespace-pre-line">{vacancy.descripcion}</p>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Información General</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Cantidad de Posiciones</p>
                <p className="font-medium text-lg">{vacancy.cantidad}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rango Salarial</p>
                <p className="font-medium text-lg">
                  {formatCurrency(vacancy.salarioMin)} - {formatCurrency(vacancy.salarioMax)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Publicación</p>
                <p className="font-medium">{formatDate(vacancy.fechaSolicitud)}</p>
              </div>
              {vacancy.fechaCierre && (
                <div>
                  <p className="text-sm text-gray-600">Fecha de Cierre</p>
                  <p className="font-medium">{formatDate(vacancy.fechaCierre)}</p>
                </div>
              )}
              {vacancy.experienciaRequerida && (
                <div>
                  <p className="text-sm text-gray-600">Experiencia Requerida</p>
                  <p className="font-medium">{vacancy.experienciaRequerida}</p>
                </div>
              )}
              {vacancy.nivelEducacion && (
                <div>
                  <p className="text-sm text-gray-600">Nivel de Educación</p>
                  <p className="font-medium">{vacancy.nivelEducacion}</p>
                </div>
              )}
            </div>
          </div>

          {vacancy.habilidadesRequeridas && vacancy.habilidadesRequeridas.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Habilidades Requeridas</h2>
              <div className="flex flex-wrap gap-2">
                {vacancy.habilidadesRequeridas.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Candidatos */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Candidatos ({candidates?.length || 0})
              </h2>
              <Link
                to="/recruitment/candidates"
                className="text-primary-600 hover:text-primary-800 text-sm font-medium"
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
                    className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {candidate.nombre} {candidate.apellido}
                        </p>
                        <p className="text-sm text-gray-600">{candidate.email}</p>
                      </div>
                      <span className={`badge ${candidateStatusColors[candidate.estadoProceso]}`}>
                        {candidateStatusLabels[candidate.estadoProceso]}
                      </span>
                    </div>
                  </Link>
                ))}
                {candidates.length > 5 && (
                  <div className="text-center pt-2">
                    <Link
                      to={`/recruitment/candidates?vacancyId=${id}`}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      Ver {candidates.length - 5} candidatos más →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No hay candidatos postulados aún</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Candidatos</span>
                <span className="text-2xl font-bold text-primary-600">
                  {candidates?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Posiciones</span>
                <span className="text-2xl font-bold text-gray-900">
                  {vacancy.cantidad}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Acciones</h2>
            <div className="space-y-3">
              <Link
                to={`/recruitment/vacancies/${id}/edit`}
                className="btn btn-primary w-full text-center"
              >
                Editar Vacante
              </Link>
              <Link
                to="/recruitment/candidates/new"
                state={{ vacancyId: id }}
                className="btn btn-secondary w-full text-center"
              >
                Agregar Candidato
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
