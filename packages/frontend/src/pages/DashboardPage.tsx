import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { EmployeeDashboardPage } from './EmployeeDashboardPage';
import { dashboardService, type DashboardStats, type PayrollTrend, type RecentActivity, type PendingSummary } from '../services/dashboard.service';
import { getEmployees } from '../services/employee.service';
import { getPayrollPeriods } from '../services/payroll.service';
import { certificationsService } from '../services/certifications.service';

export function DashboardPage() {
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    employeesCount: 0,
    employeesChange: 0,
    payrollCount: 0,
    payrollChange: 0,
    documentsCount: 0,
    documentsChange: 0,
  });
  const [payrollTrend, setPayrollTrend] = useState<PayrollTrend[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [pendingSummary, setPendingSummary] = useState<PendingSummary>({
    pendingReview: 0,
    upcomingSettlements: 0,
    pendingDocuments: 0,
  });

  // Si SOLO es empleado (sin otros roles), mostrar su dashboard específico
  const isOnlyEmployee = user?.roles?.length === 1 && hasRole('employee');
  
  if (isOnlyEmployee) {
    return <EmployeeDashboardPage />;
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [
        statsData,
        trendData,
        activityData,
        summaryData,
        employeesData,
        payrollData,
        certificationsData,
      ] = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getPayrollTrend(),
        dashboardService.getRecentActivity(),
        dashboardService.getPendingSummary(),
        getEmployees({ status: 'active' }), // Solo empleados activos
        getPayrollPeriods(), // TODOS los períodos
        certificationsService.getAll(), // Todas las certificaciones
      ]);

      console.log('🔍 Datos obtenidos:', {
        statsData: statsData.status,
        employeesData: employeesData.status === 'fulfilled' ? employeesData.value.length : 'error',
        payrollData: payrollData.status === 'fulfilled' ? payrollData.value.length : 'error',
        certificationsData: certificationsData.status === 'fulfilled' ? certificationsData.value.length : 'error',
      });

      // Procesar estadísticas - SIEMPRE usar datos reales
      const employeesCount = employeesData.status === 'fulfilled' ? employeesData.value.length : 0;
      const payrollCount = payrollData.status === 'fulfilled' ? payrollData.value.length : 0;
      const documentsCount = certificationsData.status === 'fulfilled' ? certificationsData.value.length : 0;
      
      console.log('📊 Stats del endpoint vs datos reales:', { 
        endpointStats: statsData.status === 'fulfilled' ? statsData.value : 'no disponible',
        calculadosReales: { employeesCount, payrollCount, documentsCount }
      });
      
      // Usar siempre los datos reales calculados
      setStats({
        employeesCount,
        employeesChange: 0,
        payrollCount,
        payrollChange: 0,
        documentsCount,
        documentsChange: 0,
      });

      // Procesar tendencia de nómina
      if (trendData.status === 'fulfilled' && trendData.value.length > 0) {
        
        setPayrollTrend(trendData.value);
      } else if (payrollData.status === 'fulfilled') {
        // Generar tendencia desde períodos reales
        const periods = payrollData.value;
        
        
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const trend: PayrollTrend[] = [];
        
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          
          const monthPeriods = periods.filter(p => {
            const periodDate = new Date(p.fechaInicio);
            return periodDate.getFullYear() === date.getFullYear() && 
                   periodDate.getMonth() === date.getMonth();
          });
          
          trend.push({
            month: monthNames[date.getMonth()],
            count: monthPeriods.length,
          });
        }
        
        
        setPayrollTrend(trend);
      } else {
        
      }

      if (activityData.status === 'fulfilled') {
        setRecentActivity(activityData.value);
      }

      if (summaryData.status === 'fulfilled') {
        setPendingSummary(summaryData.value);
      } else if (certificationsData.status === 'fulfilled') {
        // Calcular desde certificaciones - sin filtrar por status ya que puede no existir
        const allCerts = certificationsData.value;
        setPendingSummary({
          pendingReview: allCerts.length,
          upcomingSettlements: 0,
          pendingDocuments: allCerts.length,
        });
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxValue = Math.max(...payrollTrend.map(d => d.count), 1);

  const getStatusBadge = (status: RecentActivity['status']) => {
    switch (status) {
      case 'completed':
        return <span className="text-green-400 text-xs font-semibold">Completado</span>;
      case 'pending':
        return <span className="text-blue-400 text-xs font-semibold">Pendiente</span>;
      case 'in_progress':
        return <span className="text-yellow-400 text-xs font-semibold">En Progreso</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Bienvenido a TalentoNet</h1>
        <p className="text-slate-400">
          Usuario: <span className="text-blue-400 font-semibold">{user?.email}</span>
          {user?.roles && user.roles.length > 0 && (
            <>
              {' | '}
              Roles: <span className="text-blue-400 font-semibold capitalize ml-2">{user.roles.map(r => r.name).join(', ')}</span>
            </>
          )}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card Empleados */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition duration-300 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Empleados Activos</p>
                  <p className="text-4xl font-bold text-white">{stats.employeesCount}</p>
                  {stats.employeesChange !== 0 && (
                    <p className="text-slate-500 text-xs mt-2">
                      {stats.employeesChange > 0 ? '↑' : '↓'} {Math.abs(stats.employeesChange)} este mes
                    </p>
                  )}
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
                  <p className="text-slate-400 text-sm font-medium mb-1">Períodos de Nómina</p>
                  <p className="text-4xl font-bold text-white">{stats.payrollCount}</p>
                  {stats.payrollChange !== 0 && (
                    <p className="text-slate-500 text-xs mt-2">
                      {stats.payrollChange > 0 ? '↑' : '↓'} {Math.abs(stats.payrollChange)} últimos meses
                    </p>
                  )}
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
                  <p className="text-slate-400 text-sm font-medium mb-1">Certificaciones</p>
                  <p className="text-4xl font-bold text-white">{stats.documentsCount}</p>
                  {stats.documentsChange !== 0 && (
                    <p className="text-slate-500 text-xs mt-2">
                      {stats.documentsChange > 0 ? '↑' : '↓'} {Math.abs(stats.documentsChange)} nuevas
                    </p>
                  )}
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
            
            {payrollTrend.length > 0 ? (
              <>
                {/* Bar Chart */}
                <div className="flex items-end justify-around h-64 gap-2 px-4 py-8 bg-slate-900/50 rounded-lg">
                  {payrollTrend.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 gap-2">
                      <div className="relative w-full h-48 flex items-end justify-center">
                        {/* Número encima de la barra */}
                        {data.count > 0 && (
                          <div className="absolute -top-6 text-blue-400 text-xs font-semibold">
                            {data.count}
                          </div>
                        )}
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-500/50"
                          style={{
                            height: `${data.count > 0 ? (data.count / maxValue) * 100 : 0}%`,
                            minHeight: data.count > 0 ? '8px' : '2px',
                          }}
                          title={`${data.count} períodos`}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-400 mt-2">{data.month}</span>
                    </div>
                  ))}
                </div>

                {/* Chart Legend */}
                <div className="mt-6 flex items-center justify-between text-sm">
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded"></div>
                      <span className="text-slate-400">Períodos de Nómina</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Máximo: <span className="text-blue-400 font-semibold">{maxValue}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Promedio: <span className="text-blue-400 font-semibold">
                        {payrollTrend.length > 0 ? Math.round(payrollTrend.reduce((a, b) => a + b.count, 0) / payrollTrend.length) : 0}
                      </span></span>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition duration-200"
                  >
                    Descargar Reporte
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400">
                No hay datos de nómina disponibles
              </div>
            )}
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <span className="text-slate-400 text-sm">{activity.description}</span>
                      {getStatusBadge(activity.status)}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 py-4">
                    No hay actividad reciente
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Resumen Rápido</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-slate-400">Pendientes de revisión</span>
                  <span className="text-orange-400 font-bold text-lg">{pendingSummary.pendingReview}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-slate-400">Próximas liquidaciones</span>
                  <span className="text-red-400 font-bold text-lg">{pendingSummary.upcomingSettlements}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-slate-400">Documentos por verificar</span>
                  <span className="text-yellow-400 font-bold text-lg">{pendingSummary.pendingDocuments}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
