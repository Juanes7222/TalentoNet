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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error al cargar afiliaciones: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Afiliaciones</h1>
          <p className="text-gray-600 mt-2">
            {selectedProvider
              ? 'Empleados afiliados'
              : 'Proveedores de seguridad social (ARL, EPS, AFP, Caja)'}
          </p>
        </div>
        <div className="flex gap-3">
          {selectedProvider && (
            <button
              onClick={() => setSelectedProvider(null)}
              className="btn btn-secondary"
            >
              ← Volver a Proveedores
            </button>
          )}
          <Link to="/affiliations/report" className="btn btn-secondary">
            📊 Ver Reporte
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              className="input"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              className="input"
              value={filters.estado || ''}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
            >
              <option value="">Todos</option>
              <option value={AffiliationStatus.ACTIVO}>Activo</option>
              <option value={AffiliationStatus.RETIRADO}>Retirado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <input
              type="month"
              className="input"
              value={filters.period || ''}
              onChange={(e) => handleFilterChange('period', e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando afiliaciones...</p>
        </div>
      ) : selectedProvider ? (
        /* Vista de empleados afiliados al proveedor seleccionado */
        <div className="space-y-4">
          {/* Header del proveedor */}
          {selectedProviderData && (
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-4">
                <span className="text-5xl">
                  {getAffiliationTypeIcon(selectedProviderData.tipo)}
                </span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedProviderData.proveedor}
                  </h2>
                  <div className="flex gap-2 mt-2">
                    <span className={`badge ${affiliationTypeColors[selectedProviderData.tipo]}`}>
                      {affiliationTypeLabels[selectedProviderData.tipo]}
                    </span>
                    <span className="badge bg-gray-100 text-gray-800">
                      Código: {selectedProviderData.codigoProveedor}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    {selectedProviderData.totalAfiliados}
                  </p>
                  <p className="text-sm text-gray-600">Empleados afiliados</p>
                </div>
              </div>
            </div>
          )}

          {/* Lista de empleados */}
          <div className="grid md:grid-cols-2 gap-4">
            {selectedProviderData?.empleados.map((affiliation) => (
              <div 
                key={affiliation.id} 
                className="card hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:border-blue-300"
                onClick={() => window.location.href = `/affiliations/${affiliation.id}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {affiliation.employee
                        ? `${affiliation.employee.firstName} ${affiliation.employee.lastName}`
                        : 'Empleado desconocido'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      CC: {affiliation.employee?.identificationNumber || 'N/A'}
                    </p>
                  </div>
                  <span className={`badge ${affiliationStatusColors[affiliation.estado]}`}>
                    {affiliationStatusLabels[affiliation.estado]}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha afiliación:</span>
                    <span className="font-medium">
                      {formatDate(affiliation.fechaAfiliacion)}
                    </span>
                  </div>
                  {affiliation.fechaRetiro && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha retiro:</span>
                      <span className="font-medium text-red-600">
                        {formatDate(affiliation.fechaRetiro)}
                      </span>
                    </div>
                  )}
                  {affiliation.comprobanteFilename && (
                    <div className="flex items-center gap-2 text-green-600">
                      <span>📄</span>
                      <span className="text-xs truncate">
                        {affiliation.comprobanteFilename}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-blue-600 text-sm font-medium">
                    Ver detalles →
                  </span>
                  {affiliation.estado === AffiliationStatus.ACTIVO && (
                    <span className="text-xs text-green-600 font-medium">● Activo</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Vista de proveedores (tarjetas principales) */
        <>
          {/* Resumen general */}
          {affiliations && affiliations.length > 0 && (
            <div className="grid md:grid-cols-4 gap-4">
              <div className="card bg-blue-50">
                <p className="text-sm text-gray-600">Total Proveedores</p>
                <p className="text-3xl font-bold text-blue-600">
                  {providerStats.length}
                </p>
              </div>
              <div className="card bg-green-50">
                <p className="text-sm text-gray-600">Afiliaciones Activas</p>
                <p className="text-3xl font-bold text-green-600">
                  {affiliations.filter((a) => a.estado === AffiliationStatus.ACTIVO).length}
                </p>
              </div>
              <div className="card bg-gray-50">
                <p className="text-sm text-gray-600">Afiliaciones Retiradas</p>
                <p className="text-3xl font-bold text-gray-600">
                  {affiliations.filter((a) => a.estado === AffiliationStatus.RETIRADO).length}
                </p>
              </div>
              <div className="card bg-purple-50">
                <p className="text-sm text-gray-600">Total Empleados</p>
                <p className="text-3xl font-bold text-purple-600">
                  {new Set(affiliations.map((a) => a.employeeId)).size}
                </p>
              </div>
            </div>
          )}

          {/* Tarjetas de proveedores */}
          {providerStats.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Proveedores</h2>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {providerStats.map((provider) => (
                  <div
                    key={`${provider.tipo}-${provider.proveedor}`}
                    onClick={() => setSelectedProvider(`${provider.tipo}-${provider.proveedor}`)}
                    className="group card hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:scale-105 active:scale-100 hover:border-blue-400"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">
                        {getAffiliationTypeIcon(provider.tipo)}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {provider.proveedor}
                      </h3>
                      <span className={`badge ${affiliationTypeColors[provider.tipo]} mb-3`}>
                        {affiliationTypeLabels[provider.tipo]}
                      </span>
                      
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex justify-around text-sm">
                          <div>
                            <p className="text-2xl font-bold text-green-600">
                              {provider.activos}
                            </p>
                            <p className="text-xs text-gray-600">Activos</p>
                          </div>
                          <div className="border-l border-gray-300"></div>
                          <div>
                            <p className="text-2xl font-bold text-gray-500">
                              {provider.retirados}
                            </p>
                            <p className="text-xs text-gray-600">Retirados</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-blue-600 font-medium mt-3 group-hover:text-blue-800">
                        👆 Click para ver empleados
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                No hay afiliaciones registradas
              </p>
              <Link to="/affiliations/new" className="btn btn-primary">
                Crear Primera Afiliación
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
