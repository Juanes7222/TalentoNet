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
      [UserStatus.ACTIVE]: 'bg-green-600/10 text-green-300 border border-green-700/20',
      [UserStatus.INACTIVE]: 'bg-slate-700 text-slate-200 border border-slate-700/20',
      [UserStatus.SUSPENDED]: 'bg-red-700/10 text-red-300 border border-red-700/20',
      [UserStatus.PENDING_INVITATION]: 'bg-yellow-700/10 text-yellow-300 border border-yellow-700/20',
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Usuario no encontrado</h2>
          <Link to="/users" className="text-blue-400 hover:underline mt-4 inline-block">
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Header */}
      <div className="mb-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">{user.email}</h1>
            <p className="text-slate-400 mt-1">{user.fullName || 'Sin nombre completo'}</p>
          </div>
          <div className="flex gap-2">
            <PermissionGate permission="users.update">
              <Link
                to={`/users/${id}/edit`}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800"
              >
                Editar
              </Link>
            </PermissionGate>
            <PermissionGate permission="users.delete">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800"
              >
                Eliminar
              </button>
            </PermissionGate>
          </div>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="max-w-7xl mx-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 mb-6 border border-slate-700">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Estado:</span>
              {getStatusBadge(user.status)}
            </div>
            {user.mfaEnabled && (
              <div className="flex items-center gap-2 text-sm text-green-400">
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
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800"
                >
                  Enviar Invitación
                </button>
              )}
            </PermissionGate>
            <PermissionGate permission="users.suspend">
              {user.status === UserStatus.ACTIVE && (
                <button
                  onClick={handleSuspend}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg hover:from-yellow-700 hover:to-yellow-800"
                >
                  Suspender
                </button>
              )}
              {user.status === UserStatus.SUSPENDED && (
                <button
                  onClick={handleActivate}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800"
                >
                  Activar
                </button>
              )}
            </PermissionGate>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-700">
        <div className="border-b border-slate-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'info'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-slate-300 hover:text-slate-100'
              }`}
            >
              Información General
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'roles'
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-slate-300 hover:text-slate-100'
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
                  <label className="block text-sm font-medium text-slate-400">Email</label>
                  <p className="mt-1 text-lg text-white">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Nombre Completo</label>
                  <p className="mt-1 text-lg text-white">{user.fullName || 'No especificado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">ID de Empleado</label>
                  <p className="mt-1 text-lg text-blue-300">{user.employeeId || 'No asignado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Último Login</label>
                  <p className="mt-1 text-lg text-slate-300">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString('es-ES')
                      : 'Nunca'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">Fecha de Creación</label>
                  <p className="mt-1 text-lg text-slate-300">
                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400">
                    Última Actualización
                  </label>
                  <p className="mt-1 text-lg text-slate-300">
                    {new Date(user.updatedAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Roles Asignados</h3>
                <div className="space-y-3">
                  {user.roles.map((role) => (
                    <div key={role.id} className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-white">{role.name}</h4>
                          <p className="text-sm text-slate-400 mt-1">{role.description}</p>
                          {role.isSystem && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs bg-slate-700 text-slate-200 rounded">
                              Rol del Sistema
                            </span>
                          )}
                        </div>
                      </div>
                      {role.permissions && role.permissions.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-slate-300 mb-2">Permisos:</p>
                          <div className="flex flex-wrap gap-2">
                            {role.permissions.map((permission) => (
                              <span
                                key={permission.id}
                                className="px-2 py-1 text-xs bg-blue-900 text-blue-200 rounded"
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
