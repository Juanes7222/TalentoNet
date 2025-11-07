import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useEmployee, useDeleteEmployee } from '../features/employees/hooks';
import GenerateSettlementModal from './employees/components/GenerateSettlementModal';

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading } = useEmployee(id || '');
  const deleteEmployee = useDeleteEmployee();
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('¿Está seguro de desactivar este empleado?')) {
      try {
        await deleteEmployee.mutateAsync(id!);
        alert('Empleado desactivado exitosamente');
        navigate('/employees');
      } catch (err) {
        alert('Error al desactivar empleado');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Empleado no encontrado
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{employee.fullName}</h1>
          <p className="text-gray-600">
            {employee.identificationType} {employee.identificationNumber}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/employees" className="btn btn-secondary">← Volver</Link>
          <Link to={`/employees/${id}/edit`} className="btn btn-primary">✏️ Editar</Link>
          <button 
            onClick={() => setShowSettlementModal(true)} 
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
          >
            📋 Liquidar Contrato
          </button>
          <button onClick={handleDelete} className="btn btn-danger">Desactivar</button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Tipo de Identificación</p>
            <p className="font-medium text-gray-900">{employee.identificationType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Número de Identificación</p>
            <p className="font-medium text-gray-900">{employee.identificationNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nombres</p>
            <p className="font-medium text-gray-900">{employee.firstName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Apellidos</p>
            <p className="font-medium text-gray-900">{employee.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
            <p className="font-medium text-gray-900">
              {new Date(employee.dateOfBirth).toLocaleDateString('es-CO')} ({employee.age} años)
            </p>
          </div>
          {employee.gender && (
            <div>
              <p className="text-sm text-gray-500">Género</p>
              <p className="font-medium text-gray-900">
                {employee.gender === 'M' ? 'Masculino' : employee.gender === 'F' ? 'Femenino' : 'Otro'}
              </p>
            </div>
          )}
          {employee.phone && (
            <div>
              <p className="text-sm text-gray-500">Teléfono</p>
              <p className="font-medium text-gray-900">{employee.phone}</p>
            </div>
          )}
          {employee.address && (
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-sm text-gray-500">Dirección</p>
              <p className="font-medium text-gray-900">{employee.address}</p>
            </div>
          )}
          {employee.city && (
            <div>
              <p className="text-sm text-gray-500">Ciudad</p>
              <p className="font-medium text-gray-900">{employee.city}</p>
            </div>
          )}
          {employee.department && (
            <div>
              <p className="text-sm text-gray-500">Departamento</p>
              <p className="font-medium text-gray-900">{employee.department}</p>
            </div>
          )}
          {employee.country && (
            <div>
              <p className="text-sm text-gray-500">País</p>
              <p className="font-medium text-gray-900">{employee.country}</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Información Laboral</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Fecha de Contratación</p>
            <p className="font-medium text-gray-900">
              {new Date(employee.hireDate).toLocaleDateString('es-CO')}
            </p>
          </div>
          {employee.terminationDate && (
            <div>
              <p className="text-sm text-gray-500">Fecha de Terminación</p>
              <p className="font-medium text-gray-900">
                {new Date(employee.terminationDate).toLocaleDateString('es-CO')}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <span
              className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                employee.status === 'active' ? 'bg-green-100 text-green-800' : 
                employee.status === 'inactive' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}
            >
              {employee.status === 'active' ? 'Activo' : 
               employee.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha de Registro</p>
            <p className="font-medium text-gray-900">
              {new Date(employee.createdAt).toLocaleDateString('es-CO')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Última Actualización</p>
            <p className="font-medium text-gray-900">
              {new Date(employee.updatedAt).toLocaleDateString('es-CO')}
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Generar Liquidación */}
      {showSettlementModal && (
        <GenerateSettlementModal
          employeeId={id!}
          employeeName={employee.fullName}
          onClose={() => setShowSettlementModal(false)}
        />
      )}
    </div>
  );
}
