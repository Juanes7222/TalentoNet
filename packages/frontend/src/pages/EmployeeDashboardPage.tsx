import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { certificationsService } from '../services/certifications.service';
import { getEmployees } from '../services/employee.service';
import type { CertificationRequest, RequesterType, CertificationStatus } from '../types/certifications';

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

export function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null);
  const [certifications, setCertifications] = useState<CertificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    try {
      // Obtener información del empleado actual usando el endpoint /employees/me
      const response = await fetch('/api/v1/employees/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar información del empleado');
      }
      
      const currentEmployee = await response.json();
      const currentContract = currentEmployee.contracts?.find((c: any) => c.isCurrent);
      
      setEmployeeInfo({
        id: currentEmployee.id,
        firstName: currentEmployee.firstName,
        lastName: currentEmployee.lastName,
        email: currentEmployee.user?.email || user?.email || '',
        identificationNumber: currentEmployee.identificationNumber,
        phone: currentEmployee.phone,
        position: currentContract?.position,
        department: currentContract?.department,
        hireDate: currentEmployee.hireDate,
        salary: currentContract?.salary ? parseFloat(currentContract.salary) : undefined,
      });

      // Cargar certificaciones del empleado
      const certs = await certificationsService.getAll({ employeeId: currentEmployee.id });
      setCertifications(certs);
    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestCertification = async (type: string) => {
    if (!employeeInfo) {
      alert('No se pudo cargar la información del empleado');
      return;
    }

    setRequesting(true);
    try {
      await certificationsService.create({
        requesterNombre: `${employeeInfo.firstName} ${employeeInfo.lastName}`,
        requesterEmail: employeeInfo.email,
        requesterTipo: 'empleado' as RequesterType,
        employeeId: employeeInfo.id,
        tipoCertificado: type,
        motivo: `Solicitud de certificado de ${type}`,
        incluirSalario: type.toLowerCase().includes('ingreso'),
        incluirCargo: true,
        incluirTiempoServicio: true,
        consentimientoDatos: true,
      });

      alert(`✅ Solicitud de certificación de ${type} enviada correctamente`);
      
      // Recargar certificaciones
      await loadEmployeeData();
    } catch (error) {
      console.error('Error requesting certification:', error);
      alert('❌ Error al solicitar certificación. Por favor intenta de nuevo.');
    } finally {
      setRequesting(false);
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
            disabled={requesting}
            className="p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg text-white text-left transition-colors"
          >
            <div className="text-lg font-semibold">Certificado Laboral</div>
            <div className="text-sm text-blue-200 mt-1">Constancia de trabajo</div>
          </button>
          <button
            onClick={() => requestCertification('Ingresos')}
            disabled={requesting}
            className="p-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed rounded-lg text-white text-left transition-colors"
          >
            <div className="text-lg font-semibold">Certificado de Ingresos</div>
            <div className="text-sm text-green-200 mt-1">Para trámites bancarios</div>
          </button>
          <button
            onClick={() => requestCertification('Retenciones')}
            disabled={requesting}
            className="p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-lg text-white text-left transition-colors"
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
                className="flex justify-between items-center p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              >
                <div>
                  <div className="font-medium text-white">{cert.tipoCertificado}</div>
                  <div className="text-sm text-slate-400">
                    Solicitado: {new Date(cert.createdAt).toLocaleDateString('es-CO', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  {cert.motivo && (
                    <div className="text-xs text-slate-500 mt-1">{cert.motivo}</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      cert.estado === 'aprobado' || cert.estado === 'generado' || cert.estado === 'enviado'
                        ? 'bg-green-600 text-white'
                        : cert.estado === 'pendiente'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {cert.estado.charAt(0).toUpperCase() + cert.estado.slice(1)}
                  </span>
                  {cert.pdfUrl && cert.estado === 'generado' && (
                    <button
                      onClick={() => certificationsService.downloadPdf(cert.id, `certificado-${cert.tipoCertificado}.pdf`)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Descargar
                    </button>
                  )}
                </div>
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
