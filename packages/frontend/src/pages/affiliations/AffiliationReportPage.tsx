import { useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white">
            📊 Reporte de Afiliaciones
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={!report || !report.data || report.data.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg disabled:cursor-not-allowed"
            >
              📥 Exportar CSV
            </button>
            <Link to="/affiliations" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg">
              ← Volver
            </Link>
          </div>
        </div>

        {/* Filtro de período */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            🗓️ Período
          </label>
          <input
            type="month"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="Seleccione mes y año"
          />
          <p className="text-sm text-slate-400 mt-2">
            Deje vacío para ver todas las afiliaciones
          </p>
        </div>

        {/* Resumen general */}
        {report && report.data && report.data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 border border-blue-700 shadow-xl">
              <p className="text-sm text-blue-300">Total Registros</p>
              <p className="text-4xl font-bold text-white mt-2">
                {report.data.reduce((sum: number, item) => sum + item.total, 0)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-6 border border-green-700 shadow-xl">
              <p className="text-sm text-green-300">Activas</p>
              <p className="text-4xl font-bold text-white mt-2">
                {report.data
                  .filter((item) => item.estado === 'activo')
                  .reduce((sum: number, item) => sum + item.total, 0)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 shadow-xl">
              <p className="text-sm text-slate-300">Retiradas</p>
              <p className="text-4xl font-bold text-white mt-2">
                {report.data
                  .filter((item) => item.estado === 'retirado')
                  .reduce((sum: number, item) => sum + item.total, 0)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl p-6 border border-purple-700 shadow-xl">
              <p className="text-sm text-purple-300">Proveedores</p>
              <p className="text-4xl font-bold text-white mt-2">
                {new Set(report.data.map((item) => item.proveedor)).size}
              </p>
            </div>
          </div>
        )}

        {/* Tabla detallada */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">📋 Detalle por Tipo y Proveedor</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
              </div>
            ) : report && report.data && report.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Proveedor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {report.data.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-700/50 transition duration-200">
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
                            {affiliationTypeLabels[item.tipo]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white font-medium">{item.proveedor}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            item.estado === 'activo'
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {affiliationStatusLabels[item.estado]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-lg font-bold text-white">
                          {item.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-slate-400">
                No hay datos para el período seleccionado
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
