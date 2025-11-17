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
            <h1 className="text-4xl font-bold text-white">🏥 Afiliaciones</h1>
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
            <Link to="/affiliations/report" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200">
              📊 Ver Reporte
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4">🔍 Filtros</h2>
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
                <h2 className="text-2xl font-bold text-white mb-6">📋 Proveedores</h2>
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

                        <p className="text-xs text-blue-400 font-medium mt-4 group-hover:text-blue-300">
                          👆 Click para ver empleados
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
