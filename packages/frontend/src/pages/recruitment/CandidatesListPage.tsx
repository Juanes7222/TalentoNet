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
        <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          <span>Error al cargar candidatos: {(error as Error).message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="currentColor" fillRule="evenodd" clipRule="evenodd"><path d="M11.835 18.666a13.3 13.3 0 0 0-1.817-1.298h.09c.347-.146.668-.349.949-.6c.288-.25.537-.543.738-.868c.37-.623.566-1.333.57-2.057a2.6 2.6 0 0 0 1.517-.27a7 7 0 0 0 2.217-2.096a14 14 0 0 1 1.717-2.107c.84-.45 1.719-.824 2.626-1.118q.372-.194.689-.47c.391-.36.704-.8.918-1.287c.212-.478.32-.995.32-1.518a.32.32 0 0 0-.64 0c-.02.439-.124.87-.309 1.268c-.19.382-.454.722-.779.998a2.4 2.4 0 0 1-.549.34a17.3 17.3 0 0 0-2.795 1.098c-.909.64-1.997 2.566-3.295 3.585a1.77 1.77 0 0 1-2.336.16c-.58-.39-.31-.93 0-1.518c.629-1.129 1.657-2.417 1.717-3.605a2.2 2.2 0 0 0-.72-1.827c-1.277-1.208-2.405-1.148-3.264-.499a5.15 5.15 0 0 0-1.667 3.714c-.12 0-.23-.05-.35-.06a4.5 4.5 0 0 0-1.358.15a5.6 5.6 0 0 1 .18-1.807a19.5 19.5 0 0 1 .899-2.995a4.1 4.1 0 0 1 2.765-2.746a7.2 7.2 0 0 1 2.466-.11c1.348.12 2.746.39 4.044.4h1.308c.999-.06 1.997-.16 2.995-.22a.32.32 0 0 0 0-.64l-2.586.02h-1.697C15.13.614 13.772.255 12.404.096a7.4 7.4 0 0 0-2.825.09A4.99 4.99 0 0 0 6.244 3.57a22.6 22.6 0 0 0-.729 3.235a6.2 6.2 0 0 0-.04 2.167a3.9 3.9 0 0 0-1.368.908a5.14 5.14 0 0 0-1.367 3.195a4.88 4.88 0 0 0 1.597 4.084c-.496.332-.952.72-1.358 1.158a5.6 5.6 0 0 0-.669.949a6.6 6.6 0 0 0-.47 1.048a11.8 11.8 0 0 0-.548 2.566a.32.32 0 1 0 .629.12c.216-.79.503-1.559.858-2.297c.15-.31.31-.599.48-.898s.35-.57.539-.859a10.3 10.3 0 0 1 1.138-1.408a4.1 4.1 0 0 0 1.657.5a.32.32 0 0 0 .38-.28a.33.33 0 0 0-.29-.36c-1.747-.26-3.095-1.927-2.855-4.263a4.16 4.16 0 0 1 1.507-2.905a3.35 3.35 0 0 1 2.067-.7a7.7 7.7 0 0 1 1.827.27a4.1 4.1 0 0 1 1.388.86a3.7 3.7 0 0 0-.26.648a1.66 1.66 0 0 0 .72 1.997q.299.207.638.34c-.14.92-.63 1.75-1.367 2.316a6 6 0 0 1-.71.509a6 6 0 0 1-1.996.749a.28.28 0 0 0-.26.3a.28.28 0 0 0 .3.269a6.5 6.5 0 0 0 1.567-.13q.998.858 1.897 1.817q.658.658 1.208 1.408a4.13 4.13 0 0 1 .999 2.746a.32.32 0 0 0 .27.37a.33.33 0 0 0 .369-.28a4.57 4.57 0 0 0-.749-3.435a7.7 7.7 0 0 0-1.408-1.618M9.46 9.13a6 6 0 0 0-1.138-.359a4.34 4.34 0 0 1 1.517-3.185c.61-.4 1.358-.32 2.187.54c.829.858.38 1.527-.08 2.326c-.33.569-.729 1.148-1.068 1.687A4.8 4.8 0 0 0 9.459 9.13"/><path d="M22.219 20.642a6 6 0 0 0-.41-.908a4.5 4.5 0 0 0-.579-.819a5.7 5.7 0 0 0-1.078-.958q.305-.223.55-.51a4.18 4.18 0 0 0 .548-3.864a4.33 4.33 0 0 0-2.865-2.496a.28.28 0 0 0-.36.17a.28.28 0 0 0 .17.37a3.64 3.64 0 0 1 2.197 2.336c.105.397.135.81.09 1.218a3.6 3.6 0 0 1-.67 1.717a2.7 2.7 0 0 1-.918.69c-.54.31-1.154.472-1.777.468a3.76 3.76 0 0 1-2.756-1.497a.32.32 0 0 0-.449-.05a.33.33 0 0 0 0 .46a4.47 4.47 0 0 0 3.205 1.996c.85.06 1.7-.127 2.446-.54q.495.545.899 1.16q.24.358.449.718c.15.25.28.5.41.759q.465.965.758 1.997a.32.32 0 0 0 .38.25a.32.32 0 0 0 .25-.255a.3.3 0 0 0 0-.125a10 10 0 0 0-.49-2.287"/></g></svg>
            Candidatos
          </h1>
          <Link
            to="/recruitment/candidates/new"
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Nuevo Candidato
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-300" viewBox="0 0 32 32" fill="currentColor"><path d="M11.63 8h7.38v2h-7.38z" className="ouiIcon__fillSecondary"/><path d="M7 8h3.19v2H7z"/><path d="M7 16h7.38v2H7z" className="ouiIcon__fillSecondary"/><path d="M15.81 16H19v2h-3.19zM7 12h9v2H7z"/>
            <path d="M13 0C5.82 0 0 5.82 0 13s5.82 13 13 13s13-5.82 13-13A13 13 0 0 0 13 0m0 24C6.925 24 2 19.075 2 13S6.925 2 13 2s11 4.925 11 11s-4.925 11-11 11m9.581-.007l1.414-1.414l7.708 7.708l-1.414 1.414z"/></svg>
                Buscar
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
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                Vacante
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
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-4h2v18h-2z"/>
                </svg>
                Estado
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
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        Ver Detalles
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
