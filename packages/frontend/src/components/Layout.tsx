import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useMemo } from 'react';

export function Layout() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // Todos los items de navegación
  const allNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M13 9V3h8v6zM3 13V3h8v10zm10 8V11h8v10zM3 21v-6h8v6z"/></svg> },
    { path: '/employees', label: 'Empleados', permission: 'employees.read', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M20.72 12.88a.24.24 0 0 0-.08-.2L20 12a.26.26 0 0 0-.28 0a6.9 6.9 0 0 1-2.7.54a6.8 6.8 0 0 1-2.18-.35a.25.25 0 0 0-.31.14a7.4 7.4 0 0 1-1 1.64a.28.28 0 0 0 0 .22a6 6 0 0 0 .25.72a.25.25 0 0 0 .14.13c2.44.9 5.61 2.39 5.61 7v1.5a2 2 0 0 1 0 .22a.25.25 0 0 0 .06.2a.27.27 0 0 0 .19.08h3.72a.5.5 0 0 0 .5-.5v-.85c0-3.1-2.16-3.87-4.07-4.55l-.49-.18a.25.25 0 0 1-.14-.13a1 1 0 0 1-.07-.2a2.9 2.9 0 0 1 0-1.24a5.46 5.46 0 0 0 1.49-3.51"/><path fill="currentColor" d="M10 5.5a7 7 0 0 1 .31-2.06a.27.27 0 0 0 0-.2a.3.3 0 0 0-.17-.12A5.2 5.2 0 0 0 9 3C6.63 3 4.25 4.56 4.25 8c0 4.16 1.69 5.16 1.89 5.58a3.43 3.43 0 0 1 .06 1.91c-.07.26-.17.37-.24.4l-.76.27C2.76 17.06 0 18 0 22v1.5a.5.5 0 0 0 .5.5h17a.5.5 0 0 0 .5-.5V22c0-3.95-2.77-4.93-5.22-5.81l-.78-.26c-.07 0-.17-.14-.24-.4a3.55 3.55 0 0 1 0-1.91a7 7 0 0 0 1.33-2a.27.27 0 0 0-.09-.31a7 7 0 0 1-3-5.81"/><path fill="currentColor" d="M20 10.14a.26.26 0 0 1 .31 0l2 2a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42l-2-2a.26.26 0 0 1 0-.31A5.5 5.5 0 1 0 20 10.14M13.5 5.5A3.5 3.5 0 1 1 17 9a3.5 3.5 0 0 1-3.5-3.5"/></svg> },
    { path: '/payroll', label: 'Nómina', permission: 'payroll.read', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4.5M3 10h18m-5 9h6m-3-3l3 3l-3 3M7.005 15h.005M11 15h2"/></svg> },
    { path: '/recruitment/vacancies', label: 'Vacantes', permission: 'recruitment.read', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 2048 2048"><path fill="currentColor" d="M2048 1280v768H1024v-768h256v-256h512v256zm-640 0h256v-128h-256zm512 384h-128v128h-128v-128h-256v128h-128v-128h-128v256h768zm0-256h-768v128h768zm-355-512q-54-61-128-94t-157-34q-80 0-149 30t-122 82t-83 123t-30 149q0 92-41 173t-116 136q45 23 84 53t73 68v338q0-79-30-149t-82-122t-123-83t-149-30q-80 0-149 30t-122 82t-83 123t-30 149H0q0-73 20-141t57-129t90-108t118-81q-74-54-115-135t-42-174q0-79 30-149t82-122t122-83t150-30q92 0 173 41t136 116q38-75 97-134t135-98q-74-54-115-135t-42-174q0-79 30-149t82-122t122-83t150-30q79 0 149 30t122 82t83 123t30 149q0 92-41 173t-116 136q68 34 123 85t93 118zM512 1408q53 0 99-20t82-55t55-81t20-100q0-53-20-99t-55-82t-81-55t-100-20q-53 0-99 20t-82 55t-55 81t-20 100q0 53 20 99t55 82t81 55t100 20m512-1024q0 53 20 99t55 82t81 55t100 20q53 0 99-20t82-55t55-81t20-100q0-53-20-99t-55-82t-81-55t-100-20q-53 0-99 20t-82 55t-55 81t-20 100"/></svg>},
    { path: '/recruitment/candidates', label: 'Candidatos', permission: 'recruitment.read', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"><path d="M11.835 18.666a13.3 13.3 0 0 0-1.817-1.298h.09c.347-.146.668-.349.949-.6c.288-.25.537-.543.738-.868c.37-.623.566-1.333.57-2.057a2.6 2.6 0 0 0 1.517-.27a7 7 0 0 0 2.217-2.096a14 14 0 0 1 1.717-2.107c.84-.45 1.719-.824 2.626-1.118q.372-.194.689-.47c.391-.36.704-.8.918-1.287c.212-.478.32-.995.32-1.518a.32.32 0 0 0-.64 0c-.02.439-.124.87-.309 1.268c-.19.382-.454.722-.779.998a2.4 2.4 0 0 1-.549.34a17.3 17.3 0 0 0-2.795 1.098c-.909.64-1.997 2.566-3.295 3.585a1.77 1.77 0 0 1-2.336.16c-.58-.39-.31-.93 0-1.518c.629-1.129 1.657-2.417 1.717-3.605a2.2 2.2 0 0 0-.72-1.827c-1.277-1.208-2.405-1.148-3.264-.499a5.15 5.15 0 0 0-1.667 3.714c-.12 0-.23-.05-.35-.06a4.5 4.5 0 0 0-1.358.15a5.6 5.6 0 0 1 .18-1.807a19.5 19.5 0 0 1 .899-2.995a4.1 4.1 0 0 1 2.765-2.746a7.2 7.2 0 0 1 2.466-.11c1.348.12 2.746.39 4.044.4h1.308c.999-.06 1.997-.16 2.995-.22a.32.32 0 0 0 0-.64l-2.586.02h-1.697C15.13.614 13.772.255 12.404.096a7.4 7.4 0 0 0-2.825.09A4.99 4.99 0 0 0 6.244 3.57a22.6 22.6 0 0 0-.729 3.235a6.2 6.2 0 0 0-.04 2.167a3.9 3.9 0 0 0-1.368.908a5.14 5.14 0 0 0-1.367 3.195a4.88 4.88 0 0 0 1.597 4.084c-.496.332-.952.72-1.358 1.158a5.6 5.6 0 0 0-.669.949a6.6 6.6 0 0 0-.47 1.048a11.8 11.8 0 0 0-.548 2.566a.32.32 0 1 0 .629.12c.216-.79.503-1.559.858-2.297c.15-.31.31-.599.48-.898s.35-.57.539-.859a10.3 10.3 0 0 1 1.138-1.408a4.1 4.1 0 0 0 1.657.5a.32.32 0 0 0 .38-.28a.33.33 0 0 0-.29-.36c-1.747-.26-3.095-1.927-2.855-4.263a4.16 4.16 0 0 1 1.507-2.905a3.35 3.35 0 0 1 2.067-.7a7.7 7.7 0 0 1 1.827.27a4.1 4.1 0 0 1 1.388.86a3.7 3.7 0 0 0-.26.648a1.66 1.66 0 0 0 .72 1.997q.299.207.638.34c-.14.92-.63 1.75-1.367 2.316a6 6 0 0 1-.71.509a6 6 0 0 1-1.996.749a.28.28 0 0 0-.26.3a.28.28 0 0 0 .3.269a6.5 6.5 0 0 0 1.567-.13q.998.858 1.897 1.817q.658.658 1.208 1.408a4.13 4.13 0 0 1 .999 2.746a.32.32 0 0 0 .27.37a.33.33 0 0 0 .369-.28a4.57 4.57 0 0 0-.749-3.435a7.7 7.7 0 0 0-1.408-1.618M9.46 9.13a6 6 0 0 0-1.138-.359a4.34 4.34 0 0 1 1.517-3.185c.61-.4 1.358-.32 2.187.54c.829.858.38 1.527-.08 2.326c-.33.569-.729 1.148-1.068 1.687A4.8 4.8 0 0 0 9.459 9.13"/><path d="M22.219 20.642a6 6 0 0 0-.41-.908a4.5 4.5 0 0 0-.579-.819a5.7 5.7 0 0 0-1.078-.958q.305-.223.55-.51a4.18 4.18 0 0 0 .548-3.864a4.33 4.33 0 0 0-2.865-2.496a.28.28 0 0 0-.36.17a.28.28 0 0 0 .17.37a3.64 3.64 0 0 1 2.197 2.336c.105.397.135.81.09 1.218a3.6 3.6 0 0 1-.67 1.717a2.7 2.7 0 0 1-.918.69c-.54.31-1.154.472-1.777.468a3.76 3.76 0 0 1-2.756-1.497a.32.32 0 0 0-.449-.05a.33.33 0 0 0 0 .46a4.47 4.47 0 0 0 3.205 1.996c.85.06 1.7-.127 2.446-.54q.495.545.899 1.16q.24.358.449.718c.15.25.28.5.41.759q.465.965.758 1.997a.32.32 0 0 0 .38.25a.32.32 0 0 0 .25-.255a.3.3 0 0 0 0-.125a10 10 0 0 0-.49-2.287"/></g></svg> },
    { path: '/affiliations', label: 'Afiliaciones', permission: 'affiliations.read', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none"><path d="M3 4.65V12c0 7.35 9 10.5 9 10.5s9-3.15 9-10.5V4.65L12 1.5z" clip-rule="evenodd"/><path stroke="currentColor" stroke-linecap="square" stroke-width="2" d="M3 4.65V12c0 7.35 9 10.5 9 10.5s9-3.15 9-10.5V4.65L12 1.5z" clip-rule="evenodd"/><path stroke="currentColor" stroke-linecap="square" stroke-width="2" d="M8.173 11.172L11 14l5.657-5.657"/></g></svg> },
    { path: '/settlements', label: 'Liquidaciones', permission: 'settlements.read', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"><path d="M5 20V4a1 1 0 0 1 1-1h6.172a2 2 0 0 1 1.414.586l4.828 4.828A2 2 0 0 1 19 9.828V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><path d="M12 3v6a1 1 0 0 0 1 1h6"/></g></svg> },
    { path: '/certifications', label: 'Certificaciones', permission: 'certifications.read', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><rect width="15" height="18.5" x="4.5" y="2.75" rx="3.5"/><path d="M8.5 6.755h7m-7 4h7m-7 4H12"/></g></svg> },
    { path: '/users', label: 'Usuarios', permission: 'users.read', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="9" r="2"/><path d="M13 15c0 1.105 0 2-4 2s-4-.895-4-2s1.79-2 4-2s4 .895 4 2Z"/><path d="M2 12c0-3.771 0-5.657 1.172-6.828S6.229 4 10 4h4c3.771 0 5.657 0 6.828 1.172S22 8.229 22 12s0 5.657-1.172 6.828S17.771 20 14 20h-4c-3.771 0-5.657 0-6.828-1.172S2 15.771 2 12Z"/><path stroke-linecap="round" d="M19 12h-4m4-3h-5m5 6h-3"/></g></svg>},
    { path: '/roles', label: 'Roles y Permisos', permission: 'roles.manage', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 2048 2048"><path fill="currentColor" d="M2048 1573v475h-512v-256h-256v-256h-256v-207q-74 39-155 59t-165 20q-97 0-187-25t-168-71t-142-110t-111-143t-71-168T0 704q0-97 25-187t71-168t110-142T349 96t168-71T704 0q97 0 187 25t168 71t142 110t111 143t71 168t25 187q0 51-8 101t-23 98zm-128 54l-690-690q22-57 36-114t14-119q0-119-45-224t-124-183t-183-123t-224-46q-119 0-224 45T297 297T174 480t-46 224q0 119 45 224t124 183t183 123t224 46q97 0 190-33t169-95h89v256h256v256h256v256h256zM512 384q27 0 50 10t40 27t28 41t10 50q0 27-10 50t-27 40t-41 28t-50 10q-27 0-50-10t-40-27t-28-41t-10-50q0-27 10-50t27-40t41-28t50-10"/></svg> },
  ];

  // Filtrar items visibles según permisos
  const visibleItems = useMemo(() => {
    return allNavItems.filter(item => !item.permission || hasPermission(item.permission));
  }, [user]);

  // Determinar si necesitamos el menú desplegable (más de 5 items)
  const needsDropdown = visibleItems.length > 5;

  // Dividir items si es necesario
  const primaryNavItems = needsDropdown ? visibleItems.slice(0, 4) : visibleItems;
  const secondaryNavItems = needsDropdown ? visibleItems.slice(4) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
                <span className="text-white font-bold text-lg">TN</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                TalentoNet
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-1">
              {/* Primary nav items */}
              {primaryNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive(item.path)
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              {/* Dropdown "Más" - solo si hay items secundarios */}
              {needsDropdown && (
                <div className="relative">
                  <button
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      moreMenuOpen || secondaryNavItems.some(item => isActive(item.path))
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                  >
                    <span>⋯</span>
                    Más
                    <svg className={`w-4 h-4 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  {moreMenuOpen && (
                    <>
                      {/* Backdrop para cerrar el menú */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setMoreMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 py-2 z-20">
                        {secondaryNavItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMoreMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                              isActive(item.path)
                                ? 'bg-blue-600/20 text-blue-400'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                            }`}
                          >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right side - User info and logout */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold text-xs">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-slate-200 font-medium text-sm">{user?.email}</p>
                  {user?.roles && user.roles.length > 0 && (
                    <p className="text-slate-500 text-xs">{user.roles.map(r => r.name).join(', ')}</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                data-testid="logout-button"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 space-y-2 border-t border-slate-700 mt-4 pt-4">
              {/* Primary items */}
              <div className="space-y-1">
                {primaryNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Secondary items - solo si hay menú desplegable */}
              {needsDropdown && (
                <>
                  {/* Separator */}
                  <div className="border-t border-slate-700 my-2"></div>

                  <div className="space-y-1">
                    <div className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Más opciones
                    </div>
                    {secondaryNavItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive(item.path)
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white mt-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
