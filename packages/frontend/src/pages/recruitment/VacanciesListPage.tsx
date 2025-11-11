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

// Componente de alerta personalizada
const CustomAlert = ({ 
  message, 
  onClose 
}: { 
  message: string;
  onClose: (confirmed?: boolean) => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="backdrop-blur-xl bg-slate-900/95 rounded-2xl border border-white/20 p-6 max-w-md w-full shadow-2xl transform animate-scale-in">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <p className="text-center text-white text-lg mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={() => onClose(false)}
            className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all duration-200 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={() => onClose(true)}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90 text-white rounded-xl transition-all duration-200 font-medium shadow-lg"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function VacanciesListPage() {
  const [filterStatus, setFilterStatus] = useState<VacancyStatus | undefined>();
  const [vacancyToDelete, setVacancyToDelete] = useState<string | null>(null);
  const { data: vacancies, isLoading, error } = useVacancies(filterStatus);
  const deleteVacancy = useDeleteVacancy();

  const handleDeleteClick = (id: string) => {
    setVacancyToDelete(id);
  };

  const handleDeleteConfirm = async (confirmed?: boolean) => {
    if (confirmed && vacancyToDelete) {
      await deleteVacancy.mutateAsync(vacancyToDelete);
    }
    setVacancyToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-blue-500"></div>
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
        </div>
        <p className="text-slate-400 mt-6 text-lg">Cargando vacantes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center p-4">
        <div className="backdrop-blur-xl bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl max-w-md">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Error al cargar vacantes: {(error as Error).message}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerta de confirmación */}
      {vacancyToDelete && (
        <CustomAlert
          message="¿Está seguro de que desea eliminar esta vacante?"
          onClose={handleDeleteConfirm}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            💼 Vacantes
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {vacancies?.length || 0} posiciones disponibles
          </p>
        </div>
        <Link
          to="/recruitment/vacancies/new"
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nueva Vacante</span>
        </Link>
      </div>

      {/* Filtros */}
      <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtrar por estado:
          </label>
          <select
            className="flex-1 sm:flex-initial sm:min-w-[200px] px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            value={filterStatus || ''}
            onChange={(e) => setFilterStatus(e.target.value as VacancyStatus || undefined)}
          >
            <option value="">Todos los estados</option>
            {Object.entries(vacancyStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de vacantes */}
      {vacancies && vacancies.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vacancies.map((vacancy, index) => (
            <div 
              key={vacancy.id} 
              className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 hover:bg-white/15 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group animate-fade-in-up shadow-xl hover:shadow-2xl hover:shadow-blue-500/20"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              {/* Header del card */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors mb-1">
                    {vacancy.cargo}
                  </h3>
                  <p className="text-sm text-slate-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {vacancy.departamento}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ml-2 ${
                  vacancy.estado === VacancyStatus.ABIERTA 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                    : vacancy.estado === VacancyStatus.CERRADA
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                }`}>
                  {vacancyStatusLabels[vacancy.estado]}
                </span>
              </div>

              {/* Descripción */}
              <p className="text-sm text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                {vacancy.descripcion}
              </p>

              {/* Detalles en grid */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between backdrop-blur-sm bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <span className="text-lg">👥</span>
                    Posiciones:
                  </span>
                  <span className="font-bold text-white text-lg">{vacancy.cantidad}</span>
                </div>
                <div className="flex items-center justify-between backdrop-blur-sm bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    Salario:
                  </span>
                  <span className="font-medium text-green-400 text-xs">
                    {formatCurrency(vacancy.salarioMin)} - {formatCurrency(vacancy.salarioMax)}
                  </span>
                </div>
                <div className="flex items-center justify-between backdrop-blur-sm bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                  <span className="text-sm text-slate-400 flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    Publicada:
                  </span>
                  <span className="font-medium text-blue-400 text-xs">{formatDate(vacancy.fechaSolicitud)}</span>
                </div>
              </div>

              {/* Habilidades requeridas */}
              {vacancy.habilidadesRequeridas && vacancy.habilidadesRequeridas.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Habilidades requeridas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {vacancy.habilidadesRequeridas.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {vacancy.habilidadesRequeridas.length > 3 && (
                      <span className="text-xs px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg border border-slate-600/30 font-medium">
                        +{vacancy.habilidadesRequeridas.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <Link
                  to={`/recruitment/vacancies/${vacancy.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver Detalles
                </Link>
                <button
                  onClick={() => handleDeleteClick(vacancy.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={deleteVacancy.isPending}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-12 text-center">
          <div className="text-6xl mb-4">💼</div>
          <p className="text-slate-300 text-lg mb-2">
            No hay vacantes registradas
          </p>
          <p className="text-slate-500 text-sm mb-6">
            Comienza creando tu primera vacante
          </p>
          <Link 
            to="/recruitment/vacancies/new" 
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Crear Primera Vacante</span>
          </Link>
        </div>
      )}

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}