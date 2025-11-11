import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAffiliations } from '../../hooks/useAffiliations';
import {
  AffiliationType,
  AffiliationStatus,
  AffiliationFilterDto,
  type Affiliation,
} from '../../types/affiliations';
import {
  affiliationTypeLabels,
  affiliationStatusLabels,
  affiliationTypeColors,
  affiliationStatusColors,
  formatDate,
  getAffiliationTypeIcon,
} from '../../utils/affiliations.utils';

interface ProviderStats {
  proveedor: string;
  tipo: AffiliationType;
  codigoProveedor: string;
  totalAfiliados: number;
  activos: number;
  retirados: number;
  empleados: Affiliation[];
}

export default function AffiliationsListPage() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [filters, setFilters] = useState<AffiliationFilterDto>({});
  
  const { data: affiliations, isLoading, error } = useAffiliations(filters);

  // Agrupar afiliaciones por proveedor
  const providerStats: ProviderStats[] = affiliations
    ? Object.values(
        affiliations.reduce((acc, affiliation) => {
          const key = `${affiliation.tipo}-${affiliation.proveedor}`;
          if (!acc[key]) {
            acc[key] = {
              proveedor: affiliation.proveedor,
              tipo: affiliation.tipo,
              codigoProveedor: affiliation.codigoProveedor || '',
              totalAfiliados: 0,
              activos: 0,
              retirados: 0,
              empleados: [],
            };
          }
          acc[key].totalAfiliados++;
          if (affiliation.estado === AffiliationStatus.ACTIVO) {
            acc[key].activos++;
          } else {
            acc[key].retirados++;
          }
          acc[key].empleados.push(affiliation);
          return acc;
        }, {} as Record<string, ProviderStats>)
      ).sort((a, b) => b.activos - a.activos)
    : [];

  const handleFilterChange = (key: keyof AffiliationFilterDto, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setSelectedProvider(null);
  };

  const selectedProviderData = providerStats.find(
    (p) => `${p.tipo}-${p.proveedor}` === selectedProvider
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center p-4">
        <div className="backdrop-blur-xl bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl max-w-md">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Error al cargar afiliaciones: {(error as Error).message}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con animación */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            {selectedProvider ? '👥 Empleados Afiliados' : '🏢 Afiliaciones'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {selectedProvider
              ? 'Gestiona los empleados afiliados a este proveedor'
              : 'Proveedores de seguridad social (ARL, EPS, AFP, Caja)'}
          </p>
        </div>
        <div className="flex gap-3">
          {selectedProvider && (
            <button
              onClick={() => setSelectedProvider(null)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 border border-slate-600/50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Volver</span>
            </button>
          )}
          <Link 
            to="/affiliations/report" 
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Ver Reporte</span>
          </Link>
        </div>
      </div>

      {/* Filtros mejorados */}
      <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-4">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipo de Afiliación
            </label>
            <select
              className="block w-full px-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              value={filters.tipo || ''}
              onChange={(e) => handleFilterChange('tipo', e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value={AffiliationType.ARL}>🛡️ ARL</option>
              <option value={AffiliationType.EPS}>🏥 EPS</option>
              <option value={AffiliationType.AFP}>💰 AFP</option>
              <option value={AffiliationType.CAJA}>🎁 Caja de Compensación</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Estado
            </label>
            <select
              className="block w-full px-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              value={filters.estado || ''}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value={AffiliationStatus.ACTIVO}>✅ Activo</option>
              <option value={AffiliationStatus.RETIRADO}>❌ Retirado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Período
            </label>
            <input
              type="month"
              className="block w-full px-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              value={filters.period || ''}
              onChange={(e) => handleFilterChange('period', e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-blue-500"></div>
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
          </div>
          <p className="text-slate-400 mt-6 text-lg">Cargando afiliaciones...</p>
        </div>
      ) : selectedProvider ? (
        /* Vista de empleados afiliados */
        <div className="space-y-4 animate-slide-in">
          {/* Header del proveedor con diseño épico */}
          {selectedProviderData && (
            <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-white/20 p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-6xl sm:text-7xl animate-bounce-slow">
                  {getAffiliationTypeIcon(selectedProviderData.tipo)}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {selectedProviderData.proveedor}
                  </h2>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-lg text-sm font-medium border border-blue-400/30">
                      {affiliationTypeLabels[selectedProviderData.tipo]}
                    </span>
                    <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-sm font-medium border border-slate-600/30">
                      Código: {selectedProviderData.codigoProveedor}
                    </span>
                  </div>
                </div>
                <div className="text-center backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {selectedProviderData.totalAfiliados}
                  </p>
                  <p className="text-sm text-slate-300 mt-1">Empleados</p>
                </div>
              </div>
            </div>
          )}

          {/* Grid de empleados */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedProviderData?.empleados.map((affiliation, index) => (
              <div 
                key={affiliation.id} 
                className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-4 hover:bg-white/15 hover:border-blue-400/50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1 group animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => window.location.href = `/affiliations/${affiliation.id}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-white group-hover:text-blue-300 transition-colors">
                      {affiliation.employee
                        ? `${affiliation.employee.firstName} ${affiliation.employee.lastName}`
                        : 'Empleado desconocido'}
                    </h3>
                    <p className="text-sm text-slate-400">
                      CC: {affiliation.employee?.identificationNumber || 'N/A'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    affiliation.estado === AffiliationStatus.ACTIVO 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {affiliation.estado === AffiliationStatus.ACTIVO ? '✅ Activo' : '❌ Retirado'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">📅 Fecha afiliación:</span>
                    <span className="font-medium text-white">
                      {formatDate(affiliation.fechaAfiliacion)}
                    </span>
                  </div>
                  {affiliation.fechaRetiro && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">🚪 Fecha retiro:</span>
                      <span className="font-medium text-red-400">
                        {formatDate(affiliation.fechaRetiro)}
                      </span>
                    </div>
                  )}
                  {affiliation.comprobanteFilename && (
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-2 py-1">
                      <span>📄</span>
                      <span className="text-xs text-green-300 truncate">
                        {affiliation.comprobanteFilename}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                  <span className="text-blue-400 text-sm font-medium group-hover:text-blue-300 flex items-center gap-1">
                    Ver detalles 
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  {affiliation.estado === AffiliationStatus.ACTIVO && (
                    <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Activo
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Vista de proveedores */
        <>
          {/* Cards de resumen con animación */}
          {affiliations && affiliations.length > 0 && (
            <div className="grid md:grid-cols-4 gap-4">
              <div className="backdrop-blur-xl bg-blue-500/20 rounded-xl border border-blue-400/30 p-4 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-blue-200">Total Proveedores</p>
                  <span className="text-2xl">🏢</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  {providerStats.length}
                </p>
              </div>
              <div className="backdrop-blur-xl bg-green-500/20 rounded-xl border border-green-400/30 p-4 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-green-200">Afiliaciones Activas</p>
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  {affiliations.filter((a) => a.estado === AffiliationStatus.ACTIVO).length}
                </p>
              </div>
              <div className="backdrop-blur-xl bg-red-500/20 rounded-xl border border-red-400/30 p-4 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-red-200">Afiliaciones Retiradas</p>
                  <span className="text-2xl">❌</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  {affiliations.filter((a) => a.estado === AffiliationStatus.RETIRADO).length}
                </p>
              </div>
              <div className="backdrop-blur-xl bg-purple-500/20 rounded-xl border border-purple-400/30 p-4 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-purple-200">Total Empleados</p>
                  <span className="text-2xl">👥</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  {new Set(affiliations.map((a) => a.employeeId)).size}
                </p>
              </div>
            </div>
          )}

          {/* Tarjetas de proveedores con efecto 3D */}
          {providerStats.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                Proveedores Registrados
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {providerStats.map((provider, index) => (
                  <div
                    key={`${provider.tipo}-${provider.proveedor}`}
                    onClick={() => setSelectedProvider(`${provider.tipo}-${provider.proveedor}`)}
                    className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 hover:bg-white/15 hover:border-blue-400/50 transition-all duration-300 cursor-pointer transform hover:scale-110 hover:-translate-y-3 hover:rotate-1 active:scale-100 group animate-fade-in-up shadow-xl hover:shadow-2xl hover:shadow-blue-500/20"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
                        {getAffiliationTypeIcon(provider.tipo)}
                      </div>
                      <h3 className="font-bold text-lg text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {provider.proveedor}
                      </h3>
                      <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-medium border border-blue-400/30 mb-4">
                        {affiliationTypeLabels[provider.tipo]}
                      </span>
                      
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="backdrop-blur-sm bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                            <p className="text-2xl font-bold text-green-400">
                              {provider.activos}
                            </p>
                            <p className="text-xs text-green-300">Activos</p>
                          </div>
                          <div className="backdrop-blur-sm bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                            <p className="text-2xl font-bold text-red-400">
                              {provider.retirados}
                            </p>
                            <p className="text-xs text-red-300">Retirados</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-blue-400 font-medium mt-4 group-hover:text-blue-300 flex items-center justify-center gap-1">
                        <span>👆</span>
                        Click para ver empleados
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-slate-300 text-lg mb-6">
                No hay afiliaciones registradas
              </p>
              <Link 
                to="/affiliations/new" 
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Crear Primera Afiliación</span>
              </Link>
            </div>
          )}
        </>
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
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}