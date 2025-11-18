import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, UserStatus, Role } from '../../types/auth';
import usersService, { UserFilters } from '../../services/users.service';
import rolesService from '../../services/roles.service';
import { PermissionGate } from '../../components/PermissionGate';

export function UsersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({ page: 1, limit: 10 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.findAll(filters);
      setUsers(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await rolesService.findAll();
      setRoles(data);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;

    try {
      await usersService.delete(id);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar usuario');
    }
  };

  const handleSuspend = async (id: string) => {
    if (!confirm('¿Está seguro de suspender este usuario?')) return;

    try {
      await usersService.suspend(id);
      loadUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Error al suspender usuario');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await usersService.activate(id);
      loadUsers();
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Error al activar usuario');
    }
  };

  const handleSendInvitation = async (id: string) => {
    try {
      await usersService.sendInvitation(id);
      alert('Invitación enviada correctamente');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Error al enviar invitación');
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    const styles = {
      [UserStatus.ACTIVE]: 'bg-green-600/10 text-green-300 border border-green-700/20',
      [UserStatus.INACTIVE]: 'bg-slate-700 text-slate-200 border border-slate-700/20',
      [UserStatus.SUSPENDED]: 'bg-red-700/10 text-red-300 border border-red-700/20',
      [UserStatus.PENDING_INVITATION]: 'bg-yellow-700/10 text-yellow-300 border border-yellow-700/20',
    };

    const labels = {
      [UserStatus.ACTIVE]: 'Activo',
      [UserStatus.INACTIVE]: 'Inactivo',
      [UserStatus.SUSPENDED]: 'Suspendido',
      [UserStatus.PENDING_INVITATION]: 'Pendiente',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-slate-400 mt-1">Administra usuarios, roles y permisos</p>
        </div>
        <PermissionGate permission="users.create">
          <Link
            to="/users/new"
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition"
          >
            + Nuevo Usuario
          </Link>
        </PermissionGate>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Filters */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl p-4 mb-6 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Buscar por email..."
              className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.email || ''}
              onChange={(e) => setFilters({ ...filters, email: e.target.value, page: 1 })}
            />

            <select
              className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as UserStatus, page: 1 })}
            >
              <option value="">Todos los estados</option>
              <option value={UserStatus.ACTIVE}>Activo</option>
              <option value={UserStatus.INACTIVE}>Inactivo</option>
              <option value={UserStatus.SUSPENDED}>Suspendido</option>
              <option value={UserStatus.PENDING_INVITATION}>Pendiente</option>
            </select>

            <select
              className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.roleId || ''}
              onChange={(e) => setFilters({ ...filters, roleId: e.target.value, page: 1 })}
            >
              <option value="">Todos los roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setFilters({ page: 1, limit: 10 })}
              className="px-4 py-3 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-700">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500 mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Roles</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Último Login</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 bg-slate-900/10">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-700/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{user.email}</div>
                            {user.fullName && (
                              <div className="text-sm text-slate-400">{user.fullName}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <span key={role.id} className="px-2 py-1 text-xs font-medium bg-slate-700 text-slate-200 rounded">
                                  {role.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-slate-400">Sin roles</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString('es-ES')
                            : 'Nunca'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-3 items-center">
                            <button onClick={() => navigate(`/users/${user.id}`)} className="text-slate-300 hover:text-white">Ver</button>
                            <PermissionGate permission="users.update">
                              <button onClick={() => navigate(`/users/${user.id}/edit`)} className="text-slate-300 hover:text-white">Editar</button>
                            </PermissionGate>
                            <PermissionGate permission="users.invite">
                              {user.status === UserStatus.PENDING_INVITATION && (
                                <button onClick={() => handleSendInvitation(user.id)} className="text-amber-400 hover:text-amber-300">Invitar</button>
                              )}
                            </PermissionGate>
                            <PermissionGate permission="users.suspend">
                              {user.status === UserStatus.ACTIVE && (
                                <button onClick={() => handleSuspend(user.id)} className="text-yellow-400 hover:text-yellow-300">Suspender</button>
                              )}
                              {user.status === UserStatus.SUSPENDED && (
                                <button onClick={() => handleActivate(user.id)} className="text-green-400 hover:text-green-300">Activar</button>
                              )}
                            </PermissionGate>
                            <PermissionGate permission="users.delete">
                              <button onClick={() => handleDelete(user.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
                            </PermissionGate>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-slate-900/60 px-4 py-3 flex items-center justify-between border-t border-slate-700 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                      disabled={filters.page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-slate-700 text-sm font-medium rounded-md text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                      disabled={filters.page === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-700 text-sm font-medium rounded-md text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-400">
                        Página {filters.page} de {totalPages} — {total} usuarios
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                          disabled={filters.page === 1}
                          className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-slate-700 bg-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                        >
                          Anterior
                        </button>
                        <button
                          onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                          disabled={filters.page === totalPages}
                          className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-slate-700 bg-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                        >
                          Siguiente
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
