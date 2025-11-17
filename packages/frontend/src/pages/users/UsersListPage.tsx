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
      [UserStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [UserStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
      [UserStatus.SUSPENDED]: 'bg-red-100 text-red-800',
      [UserStatus.PENDING_INVITATION]: 'bg-yellow-100 text-yellow-800',
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra usuarios, roles y permisos</p>
        </div>
        <PermissionGate permission="users.create">
          <Link
            to="/users/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Nuevo Usuario
          </Link>
        </PermissionGate>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar por email..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.email || ''}
            onChange={(e) => setFilters({ ...filters, email: e.target.value, page: 1 })}
          />
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        {user.fullName && (
                          <div className="text-sm text-gray-500">{user.fullName}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role.id}
                            className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString('es-ES')
                        : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver
                        </button>
                        
                        <PermissionGate permission="users.update">
                          <button
                            onClick={() => navigate(`/users/${user.id}/edit`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Editar
                          </button>
                        </PermissionGate>

                        <PermissionGate permission="users.invite">
                          {user.status === UserStatus.PENDING_INVITATION && (
                            <button
                              onClick={() => handleSendInvitation(user.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Invitar
                            </button>
                          )}
                        </PermissionGate>

                        <PermissionGate permission="users.suspend">
                          {user.status === UserStatus.ACTIVE && (
                            <button
                              onClick={() => handleSuspend(user.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Suspender
                            </button>
                          )}
                          {user.status === UserStatus.SUSPENDED && (
                            <button
                              onClick={() => handleActivate(user.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Activar
                            </button>
                          )}
                        </PermissionGate>

                        <PermissionGate permission="users.delete">
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                    disabled={filters.page === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{(filters.page! - 1) * filters.limit! + 1}</span> a{' '}
                      <span className="font-medium">
                        {Math.min(filters.page! * filters.limit!, total)}
                      </span>{' '}
                      de <span className="font-medium">{total}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setFilters({ ...filters, page })}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === filters.page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
