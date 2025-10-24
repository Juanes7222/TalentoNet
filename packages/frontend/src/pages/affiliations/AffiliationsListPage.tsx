import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAffiliations } from '../../hooks/useAffiliations';
import {
  AffiliationType,
  AffiliationStatus,
  AffiliationFilterDto,
} from '../../types/affiliations';
import {
  affiliationTypeLabels,
  affiliationStatusLabels,
  affiliationTypeColors,
  affiliationStatusColors,
  formatDate,
  getAffiliationTypeIcon,
} from '../../utils/affiliations.utils';

export default function AffiliationsListPage() {
  const [filters, setFilters] = useState<AffiliationFilterDto>({});
  const { data: affiliations, isLoading, error } = useAffiliations(filters);

  const handleFilterChange = (key: keyof AffiliationFilterDto, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

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
            Gestión de afiliaciones a seguridad social (ARL, EPS, AFP, Caja)
          </p>
        </div>
        <Link to="/affiliations/report" className="btn btn-secondary">
          📊 Ver Reporte
        </Link>
      </div>

      {/* Filtros */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Filtros</h3>
        <div className="grid md:grid-cols-4 gap-4">
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
              {Object.entries(affiliationTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
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
              {Object.entries(affiliationStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor
            </label>
            <input
              type="text"
              className="input"
              placeholder="Buscar proveedor..."
              value={filters.proveedor || ''}
              onChange={(e) => handleFilterChange('proveedor', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período (YYYY-MM)
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

      {/* Lista de afiliaciones */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Cargando afiliaciones...</div>
        </div>
      ) : !affiliations || affiliations.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron afiliaciones</p>
          <p className="text-gray-400 mt-2">
            Las afiliaciones aparecerán aquí cuando se registren
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {affiliations.map((affiliation) => (
            <div
              key={affiliation.id}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {getAffiliationTypeIcon(affiliation.tipo)}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {affiliation.proveedor}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <span
                          className={`badge ${affiliationTypeColors[affiliation.tipo]}`}
                        >
                          {affiliationTypeLabels[affiliation.tipo]}
                        </span>
                        <span
                          className={`badge ${affiliationStatusColors[affiliation.estado]}`}
                        >
                          {affiliationStatusLabels[affiliation.estado]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-500">Empleado:</span>
                      <p className="font-medium">
                        {affiliation.employee
                          ? `${affiliation.employee.firstName} ${affiliation.employee.lastName}`
                          : 'N/A'}
                      </p>
                      <p className="text-gray-600 text-xs">
                        CC: {affiliation.employee?.identificationNumber}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500">Fecha Afiliación:</span>
                      <p className="font-medium">
                        {formatDate(affiliation.fechaAfiliacion)}
                      </p>
                    </div>

                    {affiliation.fechaRetiro && (
                      <div>
                        <span className="text-gray-500">Fecha Retiro:</span>
                        <p className="font-medium">
                          {formatDate(affiliation.fechaRetiro)}
                        </p>
                      </div>
                    )}

                    {affiliation.comprobanteFilename && (
                      <div>
                        <span className="text-gray-500">Comprobante:</span>
                        <p className="font-medium text-xs truncate">
                          📄 {affiliation.comprobanteFilename}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/affiliations/${affiliation.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    Ver Detalles
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen */}
      {affiliations && affiliations.length > 0 && (
        <div className="card bg-gray-50">
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {affiliations.length}
              </p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {
                  affiliations.filter((a) => a.estado === AffiliationStatus.ACTIVO)
                    .length
                }
              </p>
              <p className="text-sm text-gray-600">Activas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">
                {
                  affiliations.filter(
                    (a) => a.estado === AffiliationStatus.RETIRADO
                  ).length
                }
              </p>
              <p className="text-sm text-gray-600">Retiradas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {new Set(affiliations.map((a) => a.proveedor)).size}
              </p>
              <p className="text-sm text-gray-600">Proveedores</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
