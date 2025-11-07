import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCertifications,
  useGeneratePdf,
  useDownloadPdf,
  useUpdateCertificationStatus,
} from '../../hooks/useCertifications';
import { CertificationStatus } from '../../types/certifications';

const statusLabels: Record<CertificationStatus, string> = {
  [CertificationStatus.PENDIENTE]: 'Pendiente',
  [CertificationStatus.APROBADO]: 'Aprobado',
  [CertificationStatus.GENERADO]: 'Generado',
  [CertificationStatus.RECHAZADO]: 'Rechazado',
  [CertificationStatus.ENVIADO]: 'Enviado',
};

const statusColors: Record<CertificationStatus, string> = {
  [CertificationStatus.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
  [CertificationStatus.APROBADO]: 'bg-blue-100 text-blue-800',
  [CertificationStatus.GENERADO]: 'bg-green-100 text-green-800',
  [CertificationStatus.RECHAZADO]: 'bg-red-100 text-red-800',
  [CertificationStatus.ENVIADO]: 'bg-purple-100 text-purple-800',
};

export default function CertificationsListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<CertificationStatus | ''>('');
  const { data: certifications, isLoading } = useCertifications(
    statusFilter ? { estado: statusFilter } : undefined,
  );
  const generatePdf = useGeneratePdf();
  const downloadPdf = useDownloadPdf();
  const updateStatus = useUpdateCertificationStatus();

  const handleGeneratePdf = async (id: string) => {
    try {
      await generatePdf.mutateAsync(id);
      alert('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  const handleDownloadPdf = async (id: string, employeeName: string) => {
    try {
      await downloadPdf.mutateAsync({
        id,
        filename: `certificacion-${employeeName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      });
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar el PDF');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateStatus.mutateAsync({
        id,
        data: { estado: CertificationStatus.APROBADO },
      });
      alert('Certificación aprobada');
    } catch (error) {
      console.error('Error al aprobar:', error);
      alert('Error al aprobar la certificación');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando certificaciones...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificaciones Laborales</h1>
          <p className="text-gray-600 mt-2">Gestión de solicitudes de certificaciones</p>
        </div>
        <button onClick={() => navigate('/certifications/new')} className="btn btn-primary">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nueva Certificación
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <select
            className="input max-w-xs"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CertificationStatus | '')}
          >
            <option value="">Todos</option>
            <option value={CertificationStatus.PENDIENTE}>Pendiente</option>
            <option value={CertificationStatus.APROBADO}>Aprobado</option>
            <option value={CertificationStatus.GENERADO}>Generado</option>
            <option value={CertificationStatus.RECHAZADO}>Rechazado</option>
            <option value={CertificationStatus.ENVIADO}>Enviado</option>
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="card overflow-hidden">
        {!certifications || certifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay certificaciones registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solicitante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {certifications.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {cert.employee?.firstName} {cert.employee?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cert.employee?.identificationNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cert.tipoCertificado}</div>
                      {cert.incluirSalario && (
                        <span className="text-xs text-orange-600">Con salario</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cert.requesterNombre}</div>
                      <div className="text-sm text-gray-500">{cert.requesterEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${statusColors[cert.estado]}`}>
                        {statusLabels[cert.estado]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cert.createdAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {cert.estado === CertificationStatus.PENDIENTE && (
                          <button
                            onClick={() => handleApprove(cert.id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Aprobar"
                          >
                            ✓
                          </button>
                        )}
                        {(cert.estado === CertificationStatus.APROBADO ||
                          cert.estado === CertificationStatus.PENDIENTE) && (
                          <button
                            onClick={() => handleGeneratePdf(cert.id)}
                            className="text-green-600 hover:text-green-800"
                            disabled={generatePdf.isPending}
                            title="Generar PDF"
                          >
                            📄
                          </button>
                        )}
                        {cert.pdfUrl && (
                          <button
                            onClick={() =>
                              handleDownloadPdf(
                                cert.id,
                                `${cert.employee?.firstName}-${cert.employee?.lastName}`,
                              )
                            }
                            className="text-purple-600 hover:text-purple-800"
                            title="Descargar PDF"
                          >
                            ⬇
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
