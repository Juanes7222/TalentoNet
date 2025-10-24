import { useAuth } from '../contexts/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Bienvenido a TalentoNet</h2>
        <p className="text-gray-600 mb-4">
          Usuario: <span className="font-semibold">{user?.email}</span>
        </p>
        <p className="text-gray-600 mb-6">
          Rol: <span className="font-semibold capitalize">{user?.role}</span>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Empleados</h3>
            <p className="text-3xl font-bold text-blue-600">30</p>
            <p className="text-sm text-gray-500">Total activos</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Nóminas</h3>
            <p className="text-3xl font-bold text-green-600">90</p>
            <p className="text-sm text-gray-500">Procesadas</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Documentos</h3>
            <p className="text-3xl font-bold text-purple-600">120</p>
            <p className="text-sm text-gray-500">Almacenados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
