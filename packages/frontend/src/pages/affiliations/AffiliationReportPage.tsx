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
          <h1 className="text-4xl font-bold text-white flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M10 18h8v2h-8zm0-5h12v2H10zm0 10h5v2h-5z"/><path fill="currentColor" d="M25 5h-3V4a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v1H7a2 2 0 0 0-2 2v21a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2M12 4h8v4h-8Zm13 24H7V7h3v3h12V7h3Z"/></svg>
            Reporte de Afiliaciones
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={!report || !report.data || report.data.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg disabled:cursor-not-allowed flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"><path d="M7.5 17.22C7.445 16.03 6.622 16 5.505 16c-1.72 0-2.005.406-2.005 2v2c0 1.594.285 2 2.005 2c1.117 0 1.94-.03 1.995-1.22m13-4.78l-1.777 4.695c-.33.87-.494 1.305-.755 1.305c-.26 0-.426-.435-.755-1.305L15.436 16m-2.56 0h-1.18c-.473 0-.709 0-.895.076c-.634.26-.625.869-.625 1.424s-.009 1.165.625 1.424c.186.076.422.076.894.076s.708 0 .894.076c.634.26.625.869.625 1.424s.009 1.165-.625 1.424c-.186.076-.422.076-.894.076H10.41"/><path stroke-linejoin="round" d="M20 13v-2.343c0-.818 0-1.226-.152-1.594c-.152-.367-.441-.657-1.02-1.235l-4.736-4.736c-.499-.499-.748-.748-1.058-.896a2 2 0 0 0-.197-.082C12.514 2 12.161 2 11.456 2c-3.245 0-4.868 0-5.967.886a4 4 0 0 0-.603.603C4 4.59 4 6.211 4 9.456V13m9-10.5V3c0 2.828 0 4.243.879 5.121C14.757 9 16.172 9 19 9h.5"/></g></svg>
              Exportar CSV
            </button>
            <Link to="/affiliations" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg">
              ← Volver
            </Link>
          </div>
        </div>

        {/* Filtro de período */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
          <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19 4h-2V3a1 1 0 0 0-2 0v1H9V3a1 1 0 0 0-2 0v1H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m1 15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7h16Zm0-9H4V7a1 1 0 0 1 1-1h2v1a1 1 0 0 0 2 0V6h6v1a1 1 0 0 0 2 0V6h2a1 1 0 0 1 1 1Z"/></svg>
            Período
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
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.514 7.437c.34.135.697.226 1.06.27q.531.038 1.061 0a.28.28 0 0 0 .27-.28a.27.27 0 0 0-.27-.27a7.5 7.5 0 0 1-1-.08a3.7 3.7 0 0 1-.891-.27a2.26 2.26 0 0 1-1.532-2.703c.2-.68.58-1.292 1.101-1.772a4.33 4.33 0 0 1 2.803-1.311c1.771-.08 2.782 1.471 2.902 3.003a2.852 2.852 0 0 1-2.632 3.363a.32.32 0 0 0-.3.33a.33.33 0 0 0 .33.3c2.482-.01 3.593-2.012 3.503-4.013A3.883 3.883 0 0 0 18.116 0a5.15 5.15 0 0 0-3.003 1.201a4.93 4.93 0 0 0-1.731 2.733a3.003 3.003 0 0 0 2.131 3.503M5.875 21.39l-3.073-.491c-.25-.05-.65-.06-1-.13a.9.9 0 0 1-.421-.15a1.1 1.1 0 0 1-.28-.66a4.5 4.5 0 0 1 0-1.392l.36-1.682c.06-.25.11-.81.2-1.35q.049-.34.16-.661c0-.07.11-.12.08-.16a2.5 2.5 0 0 1 1.001-.19q.403 0 .8.06l-.45 1.8c-.092.27-.159.55-.2.832a1 1 0 0 0 .11.56a2.4 2.4 0 0 0 1.892.91a2.27 2.27 0 0 0 2.002-.68c.231-.38.371-.808.41-1.25a8 8 0 0 0 0-1.782h.821l.06-.691h-.18c-1.001-.14-1.882-.18-3.183-.42q-.99-.225-2.002-.32a3.44 3.44 0 0 0-1.491.25a1.23 1.23 0 0 0-.58.7Q.63 15.545.5 16.625c-.09.35-.17.71-.24 1.071c-.07.36-.08.49-.11.74a5.2 5.2 0 0 0 0 1.702c.082.443.311.845.65 1.141c.194.146.42.243.66.28c.411.07.922.05 1.232.08c.83.08 1.301.1 1.852.15c.34 0 .71.07 1.22.15a.28.28 0 0 0 .09-.55zm-1.732-4.835l.19-1.902l.49.07c.802.1 1.422.14 2.003.18a.4.4 0 0 0 0 .11a7 7 0 0 1-.14 1.602a1.9 1.9 0 0 1-.38.84c-.06.08-.191.1-.321.13c-.265.064-.54.08-.81.051a2.5 2.5 0 0 1-.802-.18c-.12-.05-.24-.08-.29-.16a3.5 3.5 0 0 1 .06-.741"/><path fill="currentColor" d="M23.761 21.53a31 31 0 0 0-2.072-3.314a3.8 3.8 0 0 1-.33-.81a1.3 1.3 0 0 1 0-.64q.395-.977.63-2.003a10.7 10.7 0 0 0-.2-2.852a14.2 14.2 0 0 0-.78-2.713a.3.3 0 0 0-.4-.19a.32.32 0 0 0-.181.41c.33.841.575 1.713.73 2.603c.158.878.202 1.773.13 2.662q-.255.948-.66 1.842a2.2 2.2 0 0 0-.06 1.07q.135.523.38 1.002a31 31 0 0 1 1.932 3.253c.098.24.122.506.07.76a.47.47 0 0 1-.34.38a1.37 1.37 0 0 1-1.001-.13a5 5 0 0 1-1.441-1.16a9.3 9.3 0 0 1-2.002-3.003a8.3 8.3 0 0 1-.6-3.513v-1.662q-.015-.578-.09-1.15a5 5 0 0 0-.21-.852a.57.57 0 0 0-.401-.33a5.9 5.9 0 0 0-1.912 0c-1.341.21-2.813.71-4.004.78a1.7 1.7 0 0 1-.65-.07l.06-.6c.11-.09.23-.19.39-.3L12 10.4l2.082-.871c.55-.2 1.091-.39 1.642-.55a16 16 0 0 1 1.681-.401a.29.29 0 1 0-.11-.57q-.886.136-1.752.37c-.57.16-1.13.33-1.691.53l-2.172.83l-1.111.571c.16-1.811.26-3.613.49-5.415a.28.28 0 0 0-.55-.09c-.41 2.002-.77 4.004-1 6.006c-.812 6.596-.261 3.603-.772 8.498a2.25 2.25 0 0 0-1.33.47a2.42 2.42 0 0 0-.882 1.451a1.832 1.832 0 0 0 1.872 2.262a.27.27 0 0 0 .3-.25a.28.28 0 0 0-.25-.3a1.15 1.15 0 0 1-1.06-1.522a1.47 1.47 0 0 1 1.61-1.09a1.3 1.3 0 0 1 1.092 1.26c.08.631-.18 1.292-1.001 1.322a.33.33 0 0 0-.32.31a.32.32 0 0 0 .31.32a1.74 1.74 0 0 0 1.851-2.001a2.3 2.3 0 0 0-1.551-2.162q.49-2.713.83-5.445c0-.39.08-.781.12-1.171q.38.1.772.08c1.18 0 2.682-.49 4.063-.661a5.3 5.3 0 0 1 1.371 0v.38q.06.5.06 1.001v1.602a9.3 9.3 0 0 0 .601 3.853a.34.34 0 0 0-.36.06q-.423.406-.751.891a3.2 3.2 0 0 0-.45 1.141a9 9 0 0 1-.25 1.181c-.05.18-.11.35-.23.41c-.371.2-.601.16-.751-.05a4 4 0 0 1-.39-2.001c-.1-1.016.022-2.04.36-3.003a5.64 5.64 0 0 1 1.811-2.402a.28.28 0 0 0-.33-.45a6.3 6.3 0 0 0-2.262 2.522a7.8 7.8 0 0 0-.59 3.393c-.025.89.185 1.77.61 2.552a1.37 1.37 0 0 0 2.002.26c.268-.175.464-.442.55-.75q.196-.755.25-1.532c.033-.319.128-.628.28-.91q.254-.44.601-.811a.2.2 0 0 0 .07-.12a10.6 10.6 0 0 0 2.072 3.002a6.4 6.4 0 0 0 1.772 1.361a2.38 2.38 0 0 0 1.681.15a1.38 1.38 0 0 0 .911-.83a2.23 2.23 0 0 0-.04-1.552"/></svg>
              Detalle por Tipo y Proveedor</h2>
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
