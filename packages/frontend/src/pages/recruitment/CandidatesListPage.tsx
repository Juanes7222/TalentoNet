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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
        <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
          ⚠️ Error al cargar candidatos: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white">👥 Candidatos</h1>
          <Link
            to="/recruitment/candidates/new"
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
          >
            ➕ Nuevo Candidato
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🔍 Buscar
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Nombre, cédula, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                💼 Vacante
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📊 Estado
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Candidato
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Cédula
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Vacante
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Fecha Postulación
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {candidates?.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-700/50 transition duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {candidate.nombre} {candidate.apellido}
                        </div>
                        <div className="text-sm text-slate-400">{candidate.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-medium">
                      {candidate.cedula}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {candidate.vacancy?.cargo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${candidateStatusColors[candidate.estadoProceso]}`}>
                        {candidateStatusLabels[candidate.estadoProceso]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {formatDate(candidate.fechaPostulacion)}
                      <div className="text-xs text-slate-500">
                        Hace {daysSince(candidate.fechaPostulacion)} días
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/recruitment/candidates/${candidate.id}`}
                        className="text-blue-400 hover:text-blue-300 transition"
                      >
                        👁️ Ver Detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {candidates?.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No se encontraron candidatos
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
