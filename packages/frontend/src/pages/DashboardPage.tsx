import { useAuth } from '../contexts/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '500ms' }}></div>
      </div>

      <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header con información del usuario */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center space-x-4">
            {/* Avatar con gradiente */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50 transform hover:rotate-6 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            
            {/* Información del usuario */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Bienvenido a TALENTUM
              </h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2 backdrop-blur-sm bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-300">{user?.email}</span>
                </div>
                <div className="flex items-center space-x-2 backdrop-blur-sm bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-slate-300 capitalize">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Grid de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Empleados */}
          <div className="group backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              {/* Icono */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="px-3 py-1 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <span className="text-xs text-blue-300 font-medium">+5 este mes</span>
                </div>
              </div>
              
              {/* Contenido */}
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Empleados</h3>
              <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text mb-2">30</p>
              <p className="text-sm text-slate-400">Total activos</p>
              
              {/* Barra de progreso */}
              <div className="mt-4 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full w-[75%] bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/50"></div>
              </div>
            </div>
          </div>

          {/* Card Nóminas */}
          <div className="group backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              {/* Icono */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/50 group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="px-3 py-1 bg-green-500/20 rounded-lg border border-green-500/30">
                  <span className="text-xs text-green-300 font-medium">100%</span>
                </div>
              </div>
              
              {/* Contenido */}
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Nóminas</h3>
              <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-green-400 to-green-600 bg-clip-text mb-2">90</p>
              <p className="text-sm text-slate-400">Procesadas</p>
              
              {/* Barra de progreso */}
              <div className="mt-4 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full w-[90%] bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg shadow-green-500/50"></div>
              </div>
            </div>
          </div>

          {/* Card Documentos */}
          <div className="group backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              {/* Icono */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="px-3 py-1 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <span className="text-xs text-purple-300 font-medium">+12 hoy</span>
                </div>
              </div>
              
              {/* Contenido */}
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Documentos</h3>
              <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text mb-2">120</p>
              <p className="text-sm text-slate-400">Almacenados</p>
              
              {/* Barra de progreso */}
              <div className="mt-4 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full w-[60%] bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/50"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección adicional - Actividad reciente */}
        <div className="mt-8 backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
              Panel de Control
            </h3>
          </div>
          <p className="text-slate-400 text-sm">
            Aquí podrás gestionar empleados, procesar nóminas y administrar documentos de manera eficiente.
          </p>
        </div>
      </div>
    </div>
  );
}