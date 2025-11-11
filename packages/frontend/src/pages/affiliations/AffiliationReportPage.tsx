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

  // Calcular estadísticas
  const stats = report?.data ? {
    total: report.data.reduce((sum: number, item) => sum + item.total, 0),
    activas: report.data
      .filter((item) => item.estado === 'activo')
      .reduce((sum: number, item) => sum + item.total, 0),
    retiradas: report.data
      .filter((item) => item.estado === 'retirado')
      .reduce((sum: number, item) => sum + item.total, 0),
    proveedores: new Set(report.data.map((item) => item.proveedor)).size
  } : null;

  // Calcular porcentajes para barras
  const maxTotal = report?.data ? Math.max(...report.data.map(item => item.total)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            📊 Reporte de Afiliaciones
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Análisis detallado por tipo, proveedor y estado
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={!report || !report.data || report.data.length === 0}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Filtro de período */}
      <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <label className="font-medium text-white">Período de Análisis</label>
        </div>
        <input
          type="month"
          className="block w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          placeholder="Seleccione mes y año"
        />
        <p className="text-sm text-slate-400 mt-2 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Deje vacío para ver todas las afiliaciones
        </p>
      </div>

      {/* Cards de resumen con animación */}
      {stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-400/30 p-5 transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center border border-blue-400/30">
                <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-3xl">📋</span>
            </div>
            <p className="text-sm text-blue-200 mb-1">Total Registros</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl border border-green-400/30 p-5 transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center border border-green-400/30">
                <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-sm text-green-200 mb-1">Activas</p>
            <p className="text-3xl font-bold text-white">{stats.activas}</p>
            <div className="mt-2 h-2 bg-green-900/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-1000"
                style={{ width: `${(stats.activas / stats.total) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl border border-red-400/30 p-5 transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-red-500/30 rounded-xl flex items-center justify-center border border-red-400/30">
                <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl">❌</span>
            </div>
            <p className="text-sm text-red-200 mb-1">Retiradas</p>
            <p className="text-3xl font-bold text-white">{stats.retiradas}</p>
            <div className="mt-2 h-2 bg-red-900/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-1000"
                style={{ width: `${(stats.retiradas / stats.total) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-400/30 p-5 transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center border border-purple-400/30">
                <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-3xl">🏢</span>
            </div>
            <p className="text-sm text-purple-200 mb-1">Proveedores</p>
            <p className="text-3xl font-bold text-white">{stats.proveedores}</p>
          </div>
        </div>
      )}

      {/* Tabla detallada con barras de progreso */}
      <div className="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Detalle por Tipo y Proveedor
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-blue-500"></div>
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
            </div>
            <p className="text-slate-400 mt-6">Cargando reporte...</p>
          </div>
        ) : report && report.data && report.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Distribución
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {report.data.map((item, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-white/5 transition-colors duration-150 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-medium border border-blue-400/30 inline-block">
                        {affiliationTypeLabels[item.tipo]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">{item.proveedor}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border inline-block ${
                        item.estado === 'activo' 
                          ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                          : 'bg-red-500/20 text-red-300 border-red-400/30'
                      }`}>
                        {item.estado === 'activo' ? '✅ Activo' : '❌ Retirado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xl font-bold text-white">{item.total}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              item.estado === 'activo'
                                ? 'bg-gradient-to-r from-green-400 to-green-500'
                                : 'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                            style={{ 
                              width: `${(item.total / maxTotal) * 100}%`,
                              transitionDelay: `${index * 100}ms`
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400 font-medium min-w-[45px] text-right">
                          {Math.round((item.total / maxTotal) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-slate-300 text-lg mb-2">
              No hay datos para el período seleccionado
            </p>
            <p className="text-slate-500 text-sm">
              Intenta seleccionar un período diferente o deja el filtro vacío
            </p>
          </div>
        )}
      </div>

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
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}