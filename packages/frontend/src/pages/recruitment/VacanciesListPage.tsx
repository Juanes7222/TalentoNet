import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVacancies, useDeleteVacancy } from '../../hooks/useRecruitment';
import { VacancyStatus } from '../../types/recruitment';
import {
  vacancyStatusLabels,
  vacancyStatusColors,
  formatCurrency,
  formatDate,
} from '../../utils/recruitment.utils';

export default function VacanciesListPage() {
  const [filterStatus, setFilterStatus] = useState<VacancyStatus | undefined>();
  const { data: vacancies, isLoading, error } = useVacancies(filterStatus);
  const deleteVacancy = useDeleteVacancy();

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar esta vacante?')) {
      await deleteVacancy.mutateAsync(id);
    }
  };

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
        <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mt-0.5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          Error al cargar vacantes: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3"><svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>Vacantes</h1>
          <Link
            to="/recruitment/vacancies/new"
            className="px-6 py-3 inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Nueva Vacante
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
          <div className="flex gap-4 items-center flex-wrap">
            <label className="text-sm font-medium text-slate-300">Filtrar por estado:</label>
            <select
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus(e.target.value as VacancyStatus || undefined)}
            >
              <option value="">Todos</option>
              {Object.entries(vacancyStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de vacantes */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vacancies?.map((vacancy) => (
            <div key={vacancy.id} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition duration-300 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{vacancy.cargo}</h3>
                  <p className="text-sm text-slate-400">{vacancy.departamento}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${vacancyStatusColors[vacancy.estado]}`}>
                  {vacancyStatusLabels[vacancy.estado]}
                </span>
              </div>

              <p className="text-sm text-slate-300 mb-4 line-clamp-3">
                {vacancy.descripcion}
              </p>

              <div className="space-y-2 text-sm text-slate-400 mb-4">
                <div className="flex justify-between">
                  <span className="inline-flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="m11.454 1.91l2.838 2.604l-.676.737l-1.662-1.525V14.09h-1V3.726L9.292 5.251l-.676-.737zM7.708 4.16h-3v-1h3zm0 3h-4v-1h4zm0 3h-5v-1h5zm0 3h-6v-1h6z" clip-rule="evenodd"/></svg>Cantidad:</span>
                  <span className="font-medium text-white">{vacancy.cantidad} posiciones</span>
                </div>
                <div className="flex justify-between">
                  <span className="inline-flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Salario:</span>
                  <span className="font-medium text-green-400">
                    {formatCurrency(vacancy.salarioMin)} - {formatCurrency(vacancy.salarioMax)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                    </svg>
                    Publicada:
                  </span>
                  <span className="font-medium text-white">{formatDate(vacancy.fechaSolicitud)}</span>
                </div>
              </div>

              {vacancy.habilidadesRequeridas && vacancy.habilidadesRequeridas.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                    </svg>
                    Habilidades:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {vacancy.habilidadesRequeridas.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                    {vacancy.habilidadesRequeridas.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                        +{vacancy.habilidadesRequeridas.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Link
                  to={`/recruitment/vacancies/${vacancy.id}`}
                  className="flex-1 px-4 py-2 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  Ver
                </Link>
                <button
                  onClick={() => handleDelete(vacancy.id)}
                  className="px-4 py-2 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 text-sm"
                  disabled={deleteVacancy.isPending}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-7 4h10"/></svg>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {vacancies?.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg">No hay vacantes registradas</p>
          </div>
        )}
      </div>
    </div>
  );
}
