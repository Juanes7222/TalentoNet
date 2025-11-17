import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Role } from '../../types/auth';
import usersService, { CreateUserDto, UpdateUserDto } from '../../services/users.service';
import rolesService from '../../services/roles.service';

export function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    identificationNumber: '',
    employeeId: '',
    roleIds: [] as string[],
    sendInvitation: false,
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadRoles();
    if (isEdit) {
      loadUser();
    }
  }, [id]);

  const loadRoles = async () => {
    try {
      const data = await rolesService.findAll();
      setRoles(data);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadUser = async () => {
    if (!id) return;
    
    try {
      const user = await usersService.findById(id);
      setFormData({
        email: user.email,
        fullName: user.fullName || '',
        identificationNumber: '',
        employeeId: user.employeeId || '',
        roleIds: user.roles.map((r) => r.id),
        sendInvitation: false,
      });
    } catch (error) {
      console.error('Error loading user:', error);
      alert('Error al cargar usuario');
      navigate('/users');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isEdit && !formData.identificationNumber) {
      newErrors.identificationNumber = 'El número de documento es requerido';
    }

    if (formData.roleIds.length === 0) {
      newErrors.roleIds = 'Debe seleccionar al menos un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      if (isEdit && id) {
        const updateData: UpdateUserDto = {
          email: formData.email,
          fullName: formData.fullName || undefined,
          employeeId: formData.employeeId || undefined,
          roleIds: formData.roleIds,
        };
        await usersService.update(id, updateData);
        alert('Usuario actualizado correctamente');
      } else {
        const createData: CreateUserDto = {
          email: formData.email,
          fullName: formData.fullName || undefined,
          identificationNumber: formData.identificationNumber,
          employeeId: formData.employeeId || undefined,
          roleIds: formData.roleIds,
          sendInvitation: formData.sendInvitation,
        };
        await usersService.create(createData);
        alert('Usuario creado correctamente. La contraseña inicial es el número de documento.');
      }
      navigate('/users');
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Editar Usuario' : 'Crear Usuario'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit
            ? 'Modifica la información del usuario'
            : 'Completa el formulario para crear un nuevo usuario'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="usuario@empresa.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Juan Pérez"
          />
        </div>

        {/* Identification Number */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.identificationNumber}
              onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.identificationNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123456789"
            />
            {errors.identificationNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.identificationNumber}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Se usará como contraseña inicial. El usuario puede cambiarla después.
            </p>
          </div>
        )}

        {/* Employee ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ID de Empleado</label>
          <input
            type="text"
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="EMP001"
          />
          <p className="mt-1 text-sm text-gray-500">
            Opcional: vincula este usuario con un empleado existente
          </p>
        </div>

        {/* Roles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roles <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {roles.map((role) => (
              <label
                key={role.id}
                className="flex items-start p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.roleIds.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{role.name}</div>
                  <div className="text-sm text-gray-500">{role.description}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.roleIds && <p className="mt-1 text-sm text-red-600">{errors.roleIds}</p>}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
}
