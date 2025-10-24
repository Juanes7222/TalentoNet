import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCandidates, useVacancies } from '../../hooks/useRecruitment';
import { CandidateStatus } from '../../types/recruitment';
import {
  candidateStatusLabels,
  candidateStatusColors,
  formatDate,
  daysSince,
} from '../../utils/recruitment.utils';

export default function CandidatesListPage() {
  const [search, setSearch] = useState('');
  const [filterVacancy, setFilterVacancy] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<CandidateStatus | undefined>();

  const { data: vacancies } = useVacancies();
  const { data: candidates, isLoading, error } = useCandidates({
    vacancyId: filterVacancy || undefined,
    estado: filterStatus,
    search: search || undefined,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando candidatos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error al cargar candidatos: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Candidatos</h1>
        <Link
          to="/recruitment/candidates/new"
          className="btn btn-primary"
        >
          + Nuevo Candidato
        </Link>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              className="input"
              placeholder="Nombre, cédula, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vacante
            </label>
            <select
              className="input"
              value={filterVacancy}
              onChange={(e) => setFilterVacancy(e.target.value)}
            >
              <option value="">Todas</option>
              {vacancies?.map((vacancy) => (
                <option key={vacancy.id} value={vacancy.id}>
                  {vacancy.cargo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              className="input"
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus(e.target.value as CandidateStatus || undefined)}
            >
              <option value="">Todos</option>
              {Object.entries(candidateStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de candidatos */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cédula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vacante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Postulación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates?.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.nombre} {candidate.apellido}
                        </div>
                        <div className="text-sm text-gray-500">{candidate.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {candidate.cedula}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.vacancy?.cargo || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${candidateStatusColors[candidate.estadoProceso]}`}>
                      {candidateStatusLabels[candidate.estadoProceso]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(candidate.fechaPostulacion)}
                    <div className="text-xs text-gray-400">
                      Hace {daysSince(candidate.fechaPostulacion)} días
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/recruitment/candidates/${candidate.id}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Ver Detalles
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {candidates?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron candidatos
          </div>
        )}
      </div>
    </div>
  );
}
