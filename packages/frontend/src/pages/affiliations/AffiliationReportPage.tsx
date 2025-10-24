import { useState } from 'react';
import { useAffiliationReport } from '../../hooks/useAffiliations';
import {
  affiliationTypeLabels,
  affiliationStatusLabels,
  affiliationTypeColors,
  affiliationStatusColors,
} from '../../utils/affiliations.utils';

export default function AffiliationReportPage() {
  const [period, setPeriod] = useState<string>('');
  const { data: report, isLoading } = useAffiliationReport(period);

  const handleExport = () => {
    if (!report || !report.data) return;
    const csv = generateCSV(report);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-afiliaciones-${period || 'completo'}.csv`;
    a.click();
  };

  const generateCSV = (reportData: typeof report) => {
    if (!reportData) return '';
    const headers = ['Tipo', 'Proveedor', 'Estado', 'Total'];
    const rows = reportData.data.map((item) => [
      affiliationTypeLabels[item.tipo],
      item.proveedor,
      affiliationStatusLabels[item.estado],
      item.total.toString(),
    ]);
    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Reporte de Afiliaciones
        </h1>
        <button
          onClick={handleExport}
          disabled={!report || !report.data || report.data.length === 0}
          className="btn btn-primary"
        >
          📊 Exportar CSV
        </button>
      </div>

      {/* Filtro de período */}
      <div className="card">
        <label className="block mb-2 font-medium">Período</label>
        <input
          type="month"
          className="input"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          placeholder="Seleccione mes y año"
        />
        <p className="text-sm text-gray-500 mt-2">
          Deje vacío para ver todas las afiliaciones
        </p>
      </div>

      {/* Resumen general */}
      {report && report.data && report.data.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card bg-blue-50">
            <p className="text-sm text-gray-600">Total Registros</p>
            <p className="text-3xl font-bold text-blue-600">
              {report.data.reduce((sum: number, item) => sum + item.total, 0)}
            </p>
          </div>
          <div className="card bg-green-50">
            <p className="text-sm text-gray-600">Activas</p>
            <p className="text-3xl font-bold text-green-600">
              {report.data
                .filter((item) => item.estado === 'activo')
                .reduce((sum: number, item) => sum + item.total, 0)}
            </p>
          </div>
          <div className="card bg-gray-50">
            <p className="text-sm text-gray-600">Retiradas</p>
            <p className="text-3xl font-bold text-gray-600">
              {report.data
                .filter((item) => item.estado === 'retirado')
                .reduce((sum: number, item) => sum + item.total, 0)}
            </p>
          </div>
          <div className="card bg-purple-50">
            <p className="text-sm text-gray-600">Proveedores</p>
            <p className="text-3xl font-bold text-purple-600">
              {new Set(report.data.map((item) => item.proveedor)).size}
            </p>
          </div>
        </div>
      )}

      {/* Tabla detallada */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Detalle por Tipo y Proveedor</h2>
        {isLoading ? (
          <p className="text-center py-8 text-gray-500">Cargando reporte...</p>
        ) : report && report.data && report.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`badge ${affiliationTypeColors[item.tipo]}`}>
                        {affiliationTypeLabels[item.tipo]}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{item.proveedor}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${affiliationStatusColors[item.estado]}`}>
                        {affiliationStatusLabels[item.estado]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-semibold">
                      {item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">
            No hay datos para el período seleccionado
          </p>
        )}
      </div>
    </div>
  );
}
