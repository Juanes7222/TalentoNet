import { useState, useEffect } from 'react';
import { Role, Permission } from '../../types/auth';
import rolesService from '../../services/roles.service';
import permissionsService from '../../services/permissions.service';
import { PermissionGate } from '../../components/PermissionGate';

export function RolesListPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        rolesService.findAll(),
        permissionsService.findAll(),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar datos. Ver consola para detalles.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPermissionsModal = async (role: Role) => {
    setSelectedRole(role);
    try {
      const rolePermissions = await rolesService.getRolePermissions(role.id);
      setSelectedPermissions(rolePermissions.map((p) => p.id));
      setShowPermissionsModal(true);
    } catch (error) {
      console.error('Error loading role permissions:', error);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      await rolesService.assignPermissions(selectedRole.id, selectedPermissions);
      alert('Permisos actualizados correctamente');
      setShowPermissionsModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert('Error al guardar permisos');
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId],
    );
  };

  const groupPermissionsByResource = () => {
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach((permission) => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push(permission);
    });
    return grouped;
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('¿Está seguro de eliminar este rol?')) return;

    try {
      await rolesService.delete(roleId);
      alert('Rol eliminado correctamente');
      loadData();
    } catch (error: any) {
      console.error('Error deleting role:', error);
      alert(error.response?.data?.message || 'Error al eliminar rol');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Roles</h1>
          <p className="text-slate-400 mt-1">Administra roles y sus permisos</p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 border border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{role.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{role.description}</p>
                </div>
                {role.isSystem && (
                  <span className="px-2 py-1 text-xs bg-slate-700 text-slate-200 rounded">Sistema</span>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-400">{role.permissions?.length || 0} permisos asignados</p>
              </div>

              <div className="flex gap-2">
                <PermissionGate permission="roles.manage">
                  <button
                    onClick={() => handleOpenPermissionsModal(role)}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded hover:from-blue-700 hover:to-blue-800"
                  >
                    Gestionar Permisos
                  </button>
                  {!role.isSystem && (
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm rounded hover:from-red-700 hover:to-red-800"
                    >
                      Eliminar
                    </button>
                  )}
                </PermissionGate>
              </div>
            </div>
          ))}
        </div>

        {/* Permissions Modal */}
        {showPermissionsModal && selectedRole && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">Permisos para: {selectedRole.name}</h2>
                <p className="text-sm text-slate-400 mt-1">Selecciona los permisos que deseas asignar a este rol</p>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-4 overflow-y-auto max-h-[60vh] space-y-6">
                {Object.entries(groupPermissionsByResource()).map(([resource, perms]) => (
                  <div key={resource} className="mb-3">
                    <h3 className="text-lg font-semibold text-white mb-3 capitalize">{resource}</h3>
                    <div className="space-y-2">
                      {perms.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-start p-3 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700/50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="mt-1 h-4 w-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-white">{permission.name}</div>
                            <div className="text-sm text-slate-400">{permission.description}</div>
                            <div className="text-xs text-slate-500 mt-1">Acción: {permission.action}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePermissions}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800"
                >
                  Guardar Permisos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Permissions List */}
        <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Permisos Disponibles</h2>
          <div className="space-y-4">
            {Object.entries(groupPermissionsByResource()).map(([resource, perms]) => (
              <div key={resource}>
                <h3 className="text-lg font-semibold text-slate-200 mb-2 capitalize">{resource}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {perms.map((permission) => (
                    <div key={permission.id} className="p-3 border border-slate-700 rounded-lg bg-slate-800">
                      <div className="text-sm font-medium text-white">{permission.name}</div>
                      <div className="text-xs text-slate-400 mt-1">{permission.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
