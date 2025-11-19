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
      ).sort((a, b) => b.activos - a.activos) // Ordenar por más activos primero
    : [];

  const handleFilterChange = (key: keyof AffiliationFilterDto, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setSelectedProvider(null); // Resetear selección al filtrar
  };

  const selectedProviderData = providerStats.find(
    (p) => `${p.tipo}-${p.proveedor}` === selectedProvider
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
        <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
          ⚠️ Error al cargar afiliaciones: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 20 25"><path fill="currentColor" d="M18 15h-2v2h2m0-6h-2v2h2m2 6h-8v-2h2v-2h-2v-2h2v-2h-2V9h8M10 7H8V5h2m0 6H8V9h2m0 6H8v-2h2m0 6H8v-2h2M6 7H4V5h2m0 6H4V9h2m0 6H4v-2h2m0 6H4v-2h2m6-10V3H2v18h20V7z"/></svg>
              Afiliaciones</h1>
            <p className="text-slate-400 mt-2">
              {selectedProvider
                ? 'Empleados afiliados'
                : 'Proveedores de seguridad social (ARL, EPS, AFP, Caja)'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {selectedProvider && (
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition duration-200"
              >
                ← Volver a Proveedores
              </button>
            )}
            <Link to="/affiliations/report" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5.697M18 14v4h4m-4-7V7a2 2 0 0 0-2-2h-2"/><path d="M8 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2m6 13a4 4 0 1 0 8 0a4 4 0 1 0-8 0m-6-7h4m-4 4h3"/></g></svg>
              Ver Reporte
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-300" viewBox="0 0 32 32" fill="currentColor"><path d="M11.63 8h7.38v2h-7.38z" className="ouiIcon__fillSecondary"/><path d="M7 8h3.19v2H7z"/><path d="M7 16h7.38v2H7z" className="ouiIcon__fillSecondary"/><path d="M15.81 16H19v2h-3.19zM7 12h9v2H7z"/>
            <path d="M13 0C5.82 0 0 5.82 0 13s5.82 13 13 13s13-5.82 13-13A13 13 0 0 0 13 0m0 24C6.925 24 2 19.075 2 13S6.925 2 13 2s11 4.925 11 11s-4.925 11-11 11m9.581-.007l1.414-1.414l7.708 7.708l-1.414 1.414z"/></svg>
            Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tipo
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                value={filters.tipo || ''}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
              >
                <option value="">Todos</option>
                <option value={AffiliationType.ARL}>ARL</option>
                <option value={AffiliationType.EPS}>EPS</option>
                <option value={AffiliationType.AFP}>AFP</option>
                <option value={AffiliationType.CAJA}>Caja de Compensación</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Estado
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                value={filters.estado || ''}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
              >
                <option value="">Todos</option>
                <option value={AffiliationStatus.ACTIVO}>Activo</option>
                <option value={AffiliationStatus.RETIRADO}>Retirado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Período
              </label>
              <input
                type="month"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                value={filters.period || ''}
                onChange={(e) => handleFilterChange('period', e.target.value)}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
          </div>
        ) : selectedProvider ? (
          /* Vista de empleados afiliados al proveedor seleccionado */
          <div className="space-y-6">
            {/* Header del proveedor */}
            {selectedProviderData && (
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <span className="text-6xl">{getAffiliationTypeIcon(selectedProviderData.tipo)}</span>
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        {selectedProviderData.proveedor}
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded-full border border-blue-500/30">
                          {affiliationTypeLabels[selectedProviderData.tipo]}
                        </span>
                        <span className="px-3 py-1 bg-slate-700 text-slate-300 text-sm font-semibold rounded-full border border-slate-600">
                          Código: {selectedProviderData.codigoProveedor}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-blue-400">
                      {selectedProviderData.totalAfiliados}
                    </p>
                    <p className="text-sm text-slate-400">Empleados afiliados</p>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de empleados */}
            <div className="grid md:grid-cols-2 gap-6">
              {selectedProviderData?.empleados.map((affiliation) => (
                <Link
                  key={affiliation.id}
                  to={`/affiliations/${affiliation.id}`}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl hover:border-blue-500 transition duration-300 transform hover:scale-105 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-white">
                        {affiliation.employee
                          ? `${affiliation.employee.firstName} ${affiliation.employee.lastName}`
                          : 'Empleado desconocido'}
                      </h3>
                      <p className="text-sm text-slate-400">
                        CC: {affiliation.employee?.identificationNumber || 'N/A'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      affiliation.estado === AffiliationStatus.ACTIVO
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {affiliationStatusLabels[affiliation.estado]}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm bg-slate-900/50 rounded-lg p-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fecha afiliación:</span>
                      <span className="font-medium text-white">
                        {formatDate(affiliation.fechaAfiliacion)}
                      </span>
                    </div>
                    {affiliation.fechaRetiro && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fecha retiro:</span>
                        <span className="font-medium text-red-400">
                          {formatDate(affiliation.fechaRetiro)}
                        </span>
                      </div>
                    )}
                    {affiliation.comprobanteFilename && (
                      <div className="flex items-center gap-2 text-green-400">
                        <span>📄</span>
                        <span className="text-xs truncate">
                          {affiliation.comprobanteFilename}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center">
                    <span className="text-blue-400 text-sm font-medium">
                      Ver detalles →
                    </span>
                    {affiliation.estado === AffiliationStatus.ACTIVO && (
                      <span className="text-xs text-green-400 font-medium">● Activo</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* Vista de proveedores (tarjetas principales) */
          <>
            {/* Resumen general */}
            {affiliations && affiliations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 border border-blue-700 shadow-xl">
                  <p className="text-sm text-blue-300">Total Proveedores</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {providerStats.length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-6 border border-green-700 shadow-xl">
                  <p className="text-sm text-green-300">Afiliaciones Activas</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {affiliations.filter((a) => a.estado === AffiliationStatus.ACTIVO).length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-xl">
                  <p className="text-sm text-slate-300">Afiliaciones Retiradas</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {affiliations.filter((a) => a.estado === AffiliationStatus.RETIRADO).length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl p-6 border border-purple-700 shadow-xl">
                  <p className="text-sm text-purple-300">Total Empleados</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {new Set(affiliations.map((a) => a.employeeId)).size}
                  </p>
                </div>
              </div>
            )}

            {/* Tarjetas de proveedores */}
            {providerStats.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.514 7.437c.34.135.697.226 1.06.27q.531.038 1.061 0a.28.28 0 0 0 .27-.28a.27.27 0 0 0-.27-.27a7.5 7.5 0 0 1-1-.08a3.7 3.7 0 0 1-.891-.27a2.26 2.26 0 0 1-1.532-2.703c.2-.68.58-1.292 1.101-1.772a4.33 4.33 0 0 1 2.803-1.311c1.771-.08 2.782 1.471 2.902 3.003a2.852 2.852 0 0 1-2.632 3.363a.32.32 0 0 0-.3.33a.33.33 0 0 0 .33.3c2.482-.01 3.593-2.012 3.503-4.013A3.883 3.883 0 0 0 18.116 0a5.15 5.15 0 0 0-3.003 1.201a4.93 4.93 0 0 0-1.731 2.733a3.003 3.003 0 0 0 2.131 3.503M5.875 21.39l-3.073-.491c-.25-.05-.65-.06-1-.13a.9.9 0 0 1-.421-.15a1.1 1.1 0 0 1-.28-.66a4.5 4.5 0 0 1 0-1.392l.36-1.682c.06-.25.11-.81.2-1.35q.049-.34.16-.661c0-.07.11-.12.08-.16a2.5 2.5 0 0 1 1.001-.19q.403 0 .8.06l-.45 1.8c-.092.27-.159.55-.2.832a1 1 0 0 0 .11.56a2.4 2.4 0 0 0 1.892.91a2.27 2.27 0 0 0 2.002-.68c.231-.38.371-.808.41-1.25a8 8 0 0 0 0-1.782h.821l.06-.691h-.18c-1.001-.14-1.882-.18-3.183-.42q-.99-.225-2.002-.32a3.44 3.44 0 0 0-1.491.25a1.23 1.23 0 0 0-.58.7Q.63 15.545.5 16.625c-.09.35-.17.71-.24 1.071c-.07.36-.08.49-.11.74a5.2 5.2 0 0 0 0 1.702c.082.443.311.845.65 1.141c.194.146.42.243.66.28c.411.07.922.05 1.232.08c.83.08 1.301.1 1.852.15c.34 0 .71.07 1.22.15a.28.28 0 0 0 .09-.55zm-1.732-4.835l.19-1.902l.49.07c.802.1 1.422.14 2.003.18a.4.4 0 0 0 0 .11a7 7 0 0 1-.14 1.602a1.9 1.9 0 0 1-.38.84c-.06.08-.191.1-.321.13c-.265.064-.54.08-.81.051a2.5 2.5 0 0 1-.802-.18c-.12-.05-.24-.08-.29-.16a3.5 3.5 0 0 1 .06-.741"/><path fill="currentColor" d="M23.761 21.53a31 31 0 0 0-2.072-3.314a3.8 3.8 0 0 1-.33-.81a1.3 1.3 0 0 1 0-.64q.395-.977.63-2.003a10.7 10.7 0 0 0-.2-2.852a14.2 14.2 0 0 0-.78-2.713a.3.3 0 0 0-.4-.19a.32.32 0 0 0-.181.41c.33.841.575 1.713.73 2.603c.158.878.202 1.773.13 2.662q-.255.948-.66 1.842a2.2 2.2 0 0 0-.06 1.07q.135.523.38 1.002a31 31 0 0 1 1.932 3.253c.098.24.122.506.07.76a.47.47 0 0 1-.34.38a1.37 1.37 0 0 1-1.001-.13a5 5 0 0 1-1.441-1.16a9.3 9.3 0 0 1-2.002-3.003a8.3 8.3 0 0 1-.6-3.513v-1.662q-.015-.578-.09-1.15a5 5 0 0 0-.21-.852a.57.57 0 0 0-.401-.33a5.9 5.9 0 0 0-1.912 0c-1.341.21-2.813.71-4.004.78a1.7 1.7 0 0 1-.65-.07l.06-.6c.11-.09.23-.19.39-.3L12 10.4l2.082-.871c.55-.2 1.091-.39 1.642-.55a16 16 0 0 1 1.681-.401a.29.29 0 1 0-.11-.57q-.886.136-1.752.37c-.57.16-1.13.33-1.691.53l-2.172.83l-1.111.571c.16-1.811.26-3.613.49-5.415a.28.28 0 0 0-.55-.09c-.41 2.002-.77 4.004-1 6.006c-.812 6.596-.261 3.603-.772 8.498a2.25 2.25 0 0 0-1.33.47a2.42 2.42 0 0 0-.882 1.451a1.832 1.832 0 0 0 1.872 2.262a.27.27 0 0 0 .3-.25a.28.28 0 0 0-.25-.3a1.15 1.15 0 0 1-1.06-1.522a1.47 1.47 0 0 1 1.61-1.09a1.3 1.3 0 0 1 1.092 1.26c.08.631-.18 1.292-1.001 1.322a.33.33 0 0 0-.32.31a.32.32 0 0 0 .31.32a1.74 1.74 0 0 0 1.851-2.001a2.3 2.3 0 0 0-1.551-2.162q.49-2.713.83-5.445c0-.39.08-.781.12-1.171q.38.1.772.08c1.18 0 2.682-.49 4.063-.661a5.3 5.3 0 0 1 1.371 0v.38q.06.5.06 1.001v1.602a9.3 9.3 0 0 0 .601 3.853a.34.34 0 0 0-.36.06q-.423.406-.751.891a3.2 3.2 0 0 0-.45 1.141a9 9 0 0 1-.25 1.181c-.05.18-.11.35-.23.41c-.371.2-.601.16-.751-.05a4 4 0 0 1-.39-2.001c-.1-1.016.022-2.04.36-3.003a5.64 5.64 0 0 1 1.811-2.402a.28.28 0 0 0-.33-.45a6.3 6.3 0 0 0-2.262 2.522a7.8 7.8 0 0 0-.59 3.393c-.025.89.185 1.77.61 2.552a1.37 1.37 0 0 0 2.002.26c.268-.175.464-.442.55-.75q.196-.755.25-1.532c.033-.319.128-.628.28-.91q.254-.44.601-.811a.2.2 0 0 0 .07-.12a10.6 10.6 0 0 0 2.072 3.002a6.4 6.4 0 0 0 1.772 1.361a2.38 2.38 0 0 0 1.681.15a1.38 1.38 0 0 0 .911-.83a2.23 2.23 0 0 0-.04-1.552"/></svg>
                  Proveedores</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {providerStats.map((provider) => (
                    <div
                      key={`${provider.tipo}-${provider.proveedor}`}
                      onClick={() => setSelectedProvider(`${provider.tipo}-${provider.proveedor}`)}
                      className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl hover:border-blue-500 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-2"
                    >
                      <div className="text-center">
                        <div className="text-5xl mb-4">
                          {getAffiliationTypeIcon(provider.tipo)}
                        </div>
                        <h3 className="font-bold text-lg text-white mb-3">
                          {provider.proveedor}
                        </h3>
                        <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30 mb-4">
                          {affiliationTypeLabels[provider.tipo]}
                        </span>
                        
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <div className="flex justify-around">
                            <div>
                              <p className="text-2xl font-bold text-green-400">
                                {provider.activos}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">Activos</p>
                            </div>
                            <div className="border-l border-slate-600"></div>
                            <div>
                              <p className="text-2xl font-bold text-slate-400">
                                {provider.retirados}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">Retirados</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-blue-400 font-medium mt-4 group-hover:text-blue-300 flex items-center justify-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M8 13V4.5a1.5 1.5 0 0 1 3 0V12m0-.5v-2a1.5 1.5 0 0 1 3 0V12m0-1.5a1.5 1.5 0 0 1 3 0V12"/><path d="M17 11.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-2h.208a6 6 0 0 1-5.012-2.7L7 19q-.468-.718-3.286-5.728a1.5 1.5 0 0 1 .536-2.022a1.87 1.87 0 0 1 2.28.28L8 13M5 3L4 2m0 5H3m11-4l1-1m0 4h1"/></g></svg>
                          Click para ver empleados
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-12 border border-slate-700 shadow-xl text-center">
                <p className="text-slate-400 text-lg mb-6">
                  No hay afiliaciones registradas
                </p>
                <Link to="/affiliations/new" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg">
                  ➕ Crear Primera Afiliación
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
