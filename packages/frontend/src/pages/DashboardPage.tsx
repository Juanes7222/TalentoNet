import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { EmployeeDashboardPage } from './EmployeeDashboardPage';

export function DashboardPage() {
  const { user, hasRole } = useAuth();
  const [chartData, setChartData] = useState<number[]>(() => 
    Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 20)
  );

  // Si SOLO es empleado (sin otros roles), mostrar su dashboard específico
  const isOnlyEmployee = user?.roles?.length === 1 && hasRole('employee');
  
  if (isOnlyEmployee) {
    return <EmployeeDashboardPage />;
  }

  const maxValue = Math.max(...chartData, 1); // Fallback to 1 to avoid NaN
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Bienvenido a TalentoNet</h1>
        <p className="text-slate-400">
          Usuario: <span className="text-blue-400 font-semibold">{user?.email}</span> | 
          Rol: <span className="text-blue-400 font-semibold capitalize ml-2">{user?.role}</span>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card Empleados */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition duration-300 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Empleados Activos</p>
              <p className="text-4xl font-bold text-white">30</p>
              <p className="text-slate-500 text-xs mt-2">↑ 2 nuevos este mes</p>
            </div>
            <div className="bg-blue-500/20 p-4 rounded-lg">
              <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card Nóminas */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 hover:border-green-500 transition duration-300 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Nóminas Procesadas</p>
              <p className="text-4xl font-bold text-white">90</p>
              <p className="text-slate-500 text-xs mt-2">↑ 5 en última semana</p>
            </div>
            <div className="bg-green-500/20 p-4 rounded-lg">
              <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.16 2.75a.75.75 0 00-.75.75v2.5a.75.75 0 001.5 0V3.5a.75.75 0 00-.75-.75z" />
                <path d="M3.5 7a.75.75 0 00-.75.75v1.5a.75.75 0 001.5 0V7.75A.75.75 0 003.5 7zm13 0a.75.75 0 00-.75.75v1.5a.75.75 0 001.5 0V7.75a.75.75 0 00-.75-.75z" />
                <path fillRule="evenodd" d="M4 10a6 6 0 1112 0 6 6 0 01-12 0zm6-8a8 8 0 100 16 8 8 0 000-16z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card Documentos */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition duration-300 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Documentos Almacenados</p>
              <p className="text-4xl font-bold text-white">120</p>
              <p className="text-slate-500 text-xs mt-2">↑ 8 nuevos documentos</p>
            </div>
            <div className="bg-purple-500/20 p-4 rounded-lg">
              <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 012-2h7.414A2 2 0 0116 2.414V16a2 2 0 01-2 2h-5a1 1 0 100-2h5V4H6v7a1 1 0 11-2 0V3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6">Tendencia de Nóminas - Últimos 12 Meses</h2>
        
        {/* Bar Chart */}
        <div className="flex items-end justify-around h-64 gap-2 px-4 py-8 bg-slate-900/50 rounded-lg">
          {chartData.map((value, index) => (
            <div key={index} className="flex flex-col items-center flex-1 gap-2">
              <div className="relative w-full h-48 flex items-end justify-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-500/50"
                  style={{
                    height: `${(value / maxValue) * 100}%`,
                    minHeight: '4px',
                  }}
                  title={`${value} nóminas`}
                />
              </div>
              <span className="text-xs font-medium text-slate-400 mt-2">{months[index]}</span>
            </div>
          ))}
        </div>

        {/* Chart Legend */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded"></div>
              <span className="text-slate-400">Nóminas Procesadas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Máximo: <span className="text-blue-400 font-semibold">{maxValue}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Promedio: <span className="text-blue-400 font-semibold">{chartData.length > 0 ? Math.round(chartData.reduce((a, b) => a + b, 0) / chartData.length) : 0}</span></span>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition duration-200">
            Descargar Reporte
          </button>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400 text-sm">Nómina procesada - Noviembre</span>
              <span className="text-green-400 text-xs font-semibold">Completado</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400 text-sm">Contrato nuevo - Juan Pérez</span>
              <span className="text-blue-400 text-xs font-semibold">Pendiente</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400 text-sm">Documento firmado - HR-2025</span>
              <span className="text-green-400 text-xs font-semibold">Completado</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Resumen Rápido</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400">Pendientes de revisión</span>
              <span className="text-orange-400 font-bold text-lg">5</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400">Próximas liquidaciones</span>
              <span className="text-red-400 font-bold text-lg">3</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400">Documentos por verificar</span>
              <span className="text-yellow-400 font-bold text-lg">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
