import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface EmployeeInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  identificationNumber: string;
  phone?: string;
  position?: string;
  department?: string;
  hireDate?: string;
  salary?: number;
}

interface Certification {
  id: string;
  tipo: string;
  fechaSolicitud: string;
  estado: string;
}

export function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    try {
      // TODO: Implementar llamada al API para obtener información del empleado
      // Por ahora, datos de ejemplo
      setEmployeeInfo({
        id: '1',
        firstName: 'Juan',
        lastName: 'Cardona',
        email: user?.email || '',
        identificationNumber: '1113858851',
        phone: '3001234567',
        position: 'Desarrollador',
        department: 'Tecnología',
        hireDate: '2024-01-15',
      });

      setCertifications([]);
    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestCertification = async (type: string) => {
    try {
      // TODO: Implementar solicitud de certificación
      alert(`Solicitud de certificación de ${type} enviada correctamente`);
    } catch (error) {
      console.error('Error requesting certification:', error);
      alert('Error al solicitar certificación');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Mi Portal</h1>
        <p className="text-slate-400 mt-1">Bienvenido, {employeeInfo?.firstName}</p>
      </div>

      {/* Información Personal */}
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Información Personal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400">Nombre Completo</label>
            <p className="text-white font-medium">
              {employeeInfo?.firstName} {employeeInfo?.lastName}
            </p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Documento</label>
            <p className="text-white font-medium">{employeeInfo?.identificationNumber}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Email</label>
            <p className="text-white font-medium">{employeeInfo?.email}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Teléfono</label>
            <p className="text-white font-medium">{employeeInfo?.phone || 'No registrado'}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Cargo</label>
            <p className="text-white font-medium">{employeeInfo?.position || 'No asignado'}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Departamento</label>
            <p className="text-white font-medium">{employeeInfo?.department || 'No asignado'}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Fecha de Ingreso</label>
            <p className="text-white font-medium">
              {employeeInfo?.hireDate
                ? new Date(employeeInfo.hireDate).toLocaleDateString('es-CO')
                : 'No registrado'}
            </p>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Solicitar Certificaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => requestCertification('Laboral')}
            className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-left transition-colors"
          >
            <div className="text-lg font-semibold">Certificado Laboral</div>
            <div className="text-sm text-blue-200 mt-1">Constancia de trabajo</div>
          </button>
          <button
            onClick={() => requestCertification('Ingresos')}
            className="p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white text-left transition-colors"
          >
            <div className="text-lg font-semibold">Certificado de Ingresos</div>
            <div className="text-sm text-green-200 mt-1">Para trámites bancarios</div>
          </button>
          <button
            onClick={() => requestCertification('Retenciones')}
            className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-left transition-colors"
          >
            <div className="text-lg font-semibold">Certificado de Retenciones</div>
            <div className="text-sm text-purple-200 mt-1">Para declaración de renta</div>
          </button>
        </div>
      </div>

      {/* Mis Certificaciones */}
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Mis Certificaciones</h2>
        {certifications.length === 0 ? (
          <p className="text-slate-400 text-center py-8">
            No tienes certificaciones solicitadas aún
          </p>
        ) : (
          <div className="space-y-3">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="flex justify-between items-center p-4 bg-slate-700 rounded-lg"
              >
                <div>
                  <div className="font-medium text-white">{cert.tipo}</div>
                  <div className="text-sm text-slate-400">
                    Solicitado: {new Date(cert.fechaSolicitud).toLocaleDateString('es-CO')}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    cert.estado === 'aprobado'
                      ? 'bg-green-600 text-white'
                      : cert.estado === 'pendiente'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {cert.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documentos */}
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Mis Documentos</h2>
        <p className="text-slate-400 text-center py-8">
          Aquí podrás ver y descargar tus documentos laborales
        </p>
      </div>
    </div>
  );
}
