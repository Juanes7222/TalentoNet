import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, UserStatus } from '../../types/auth';
import usersService from '../../services/users.service';
import { PermissionGate } from '../../components/PermissionGate';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'roles' | 'audit'>('info');

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await usersService.findById(id);
      setUser(data);
    } catch (error) {
      console.error('Error loading user:', error);
      alert('Error al cargar usuario');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!id || !confirm('¿Está seguro de suspender este usuario?')) return;

    try {
      await usersService.suspend(id);
      loadUser();
      alert('Usuario suspendido correctamente');
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Error al suspender usuario');
    }
  };

  const handleActivate = async () => {
    if (!id) return;

    try {
      await usersService.activate(id);
      loadUser();
      alert('Usuario activado correctamente');
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Error al activar usuario');
    }
  };

  const handleSendInvitation = async () => {
    if (!id) return;

    try {
      await usersService.sendInvitation(id);
      alert('Invitación enviada correctamente');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Error al enviar invitación');
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

    try {
      await usersService.delete(id);
      alert('Usuario eliminado correctamente');
      navigate('/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar usuario');
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
      [UserStatus.PENDING_INVITATION]: 'Pendiente de Invitación',
    };

    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Usuario no encontrado</h2>
          <Link to="/users" className="text-blue-600 hover:underline mt-4 inline-block">
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.email}</h1>
            <p className="text-gray-600 mt-1">{user.fullName || 'Sin nombre completo'}</p>
          </div>
          <div className="flex gap-2">
            <PermissionGate permission="users.update">
              <Link
                to={`/users/${id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Editar
              </Link>
            </PermissionGate>
            <PermissionGate permission="users.delete">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </PermissionGate>
          </div>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Estado:</span>
              {getStatusBadge(user.status)}
            </div>
            {user.mfaEnabled && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                MFA Habilitado
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <PermissionGate permission="users.invite">
              {user.status === UserStatus.PENDING_INVITATION && (
                <button
                  onClick={handleSendInvitation}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Enviar Invitación
                </button>
              )}
            </PermissionGate>
            <PermissionGate permission="users.suspend">
              {user.status === UserStatus.ACTIVE && (
                <button
                  onClick={handleSuspend}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Suspender
                </button>
              )}
              {user.status === UserStatus.SUSPENDED && (
                <button
                  onClick={handleActivate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Activar
                </button>
              )}
            </PermissionGate>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'info'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Información General
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'roles'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Roles y Permisos
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-lg text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nombre Completo</label>
                  <p className="mt-1 text-lg text-gray-900">{user.fullName || 'No especificado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">ID de Empleado</label>
                  <p className="mt-1 text-lg text-gray-900">{user.employeeId || 'No asignado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Último Login</label>
                  <p className="mt-1 text-lg text-gray-900">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString('es-ES')
                      : 'Nunca'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Fecha de Creación</label>
                  <p className="mt-1 text-lg text-gray-900">
                    {new Date(user.createdAt).toLocaleString('es-ES')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Última Actualización
                  </label>
                  <p className="mt-1 text-lg text-gray-900">
                    {new Date(user.updatedAt).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Roles Asignados</h3>
                <div className="space-y-3">
                  {user.roles.map((role) => (
                    <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{role.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                          {role.isSystem && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              Rol del Sistema
                            </span>
                          )}
                        </div>
                      </div>
                      {role.permissions && role.permissions.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Permisos:</p>
                          <div className="flex flex-wrap gap-2">
                            {role.permissions.map((permission) => (
                              <span
                                key={permission.id}
                                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                              >
                                {permission.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
