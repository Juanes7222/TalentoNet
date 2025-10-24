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
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando vacantes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error al cargar vacantes: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Vacantes</h1>
        <Link
          to="/recruitment/vacancies/new"
          className="btn btn-primary"
        >
          + Nueva Vacante
        </Link>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <select
            className="input"
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
          <div key={vacancy.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{vacancy.cargo}</h3>
                <p className="text-sm text-gray-600">{vacancy.departamento}</p>
              </div>
              <span className={`badge ${vacancyStatusColors[vacancy.estado]}`}>
                {vacancyStatusLabels[vacancy.estado]}
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-4 line-clamp-3">
              {vacancy.descripcion}
            </p>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Cantidad:</span>
                <span className="font-medium">{vacancy.cantidad} posiciones</span>
              </div>
              <div className="flex justify-between">
                <span>Salario:</span>
                <span className="font-medium">
                  {formatCurrency(vacancy.salarioMin)} - {formatCurrency(vacancy.salarioMax)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Publicada:</span>
                <span className="font-medium">{formatDate(vacancy.fechaSolicitud)}</span>
              </div>
            </div>

            {vacancy.habilidadesRequeridas && vacancy.habilidadesRequeridas.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Habilidades requeridas:</p>
                <div className="flex flex-wrap gap-1">
                  {vacancy.habilidadesRequeridas.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {vacancy.habilidadesRequeridas.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      +{vacancy.habilidadesRequeridas.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Link
                to={`/recruitment/vacancies/${vacancy.id}`}
                className="btn btn-secondary flex-1 text-center"
              >
                Ver Detalles
              </Link>
              <button
                onClick={() => handleDelete(vacancy.id)}
                className="btn bg-red-600 text-white hover:bg-red-700 px-4"
                disabled={deleteVacancy.isPending}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {vacancies?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay vacantes registradas
        </div>
      )}
    </div>
  );
}
