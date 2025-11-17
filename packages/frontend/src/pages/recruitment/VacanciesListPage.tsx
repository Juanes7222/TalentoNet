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
        <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
          ⚠️ Error al cargar vacantes: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white">💼 Vacantes</h1>
          <Link
            to="/recruitment/vacancies/new"
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
          >
            ➕ Nueva Vacante
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
                  <span>📍 Cantidad:</span>
                  <span className="font-medium text-white">{vacancy.cantidad} posiciones</span>
                </div>
                <div className="flex justify-between">
                  <span>💰 Salario:</span>
                  <span className="font-medium text-green-400">
                    {formatCurrency(vacancy.salarioMin)} - {formatCurrency(vacancy.salarioMax)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>📅 Publicada:</span>
                  <span className="font-medium text-white">{formatDate(vacancy.fechaSolicitud)}</span>
                </div>
              </div>

              {vacancy.habilidadesRequeridas && vacancy.habilidadesRequeridas.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">⚙️ Habilidades:</p>
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
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 text-center text-sm"
                >
                  👁️ Ver
                </Link>
                <button
                  onClick={() => handleDelete(vacancy.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50"
                  disabled={deleteVacancy.isPending}
                >
                  🗑️
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
