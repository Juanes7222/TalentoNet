import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCertifications,
  useGeneratePdf,
  useDownloadPdf,
  useUpdateCertificationStatus,
} from '../../hooks/useCertifications';
import { CertificationStatus } from '../../types/certifications';
import { useAuth } from '../../contexts/AuthContext';

const statusLabels: Record<CertificationStatus, string> = {
  [CertificationStatus.PENDIENTE]: 'Pendiente',
  [CertificationStatus.APROBADO]: 'Aprobado',
  [CertificationStatus.GENERADO]: 'Generado',
  [CertificationStatus.RECHAZADO]: 'Rechazado',
  [CertificationStatus.ENVIADO]: 'Enviado',
};

const badgeStyles: Record<string, string> = {
  '': 'bg-slate-700 text-slate-200',
  [CertificationStatus.PENDIENTE]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  [CertificationStatus.APROBADO]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  [CertificationStatus.GENERADO]: 'bg-green-500/20 text-green-300 border-green-500/30',
  [CertificationStatus.RECHAZADO]: 'bg-red-500/20 text-red-300 border-red-500/30',
  [CertificationStatus.ENVIADO]: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

export default function CertificationsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<CertificationStatus | ''>('');
  const { data: certifications, isLoading } = useCertifications(
    statusFilter ? { estado: statusFilter } : undefined,
  );
  const generatePdf = useGeneratePdf();
  const downloadPdf = useDownloadPdf();
  const updateStatus = useUpdateCertificationStatus();

  // Verificar si el usuario es empleado (no admin ni rrhh)
  const isEmployee = user?.roles?.some(role => role.name === 'employee') && 
                     !user?.roles?.some(role => role.name === 'admin' || role.name === 'rrhh');

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
      <div className="min-h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 32 32"><path fill="#fff" d="m25 10l1.593 3l3.407.414l-2.5 2.253L28 19l-3-1.875L22 19l.5-3.333l-2.5-2.253L23.5 13zm-3 20h-2v-5a5.006 5.006 0 0 0-5-5H9a5.006 5.006 0 0 0-5 5v5H2v-5a7.01 7.01 0 0 1 7-7h6a7.01 7.01 0 0 1 7 7zM12 4a5 5 0 1 1-5 5a5 5 0 0 1 5-5m0-2a7 7 0 1 0 7 7a7 7 0 0 0-7-7"/></svg>
              Certificaciones Laborales</h1>
            <p className="text-slate-400 mt-2">Gestión de solicitudes de certificaciones</p>
          </div>
          <button
            onClick={() => navigate('/certifications/new')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold shadow hover:from-green-700 hover:to-green-800"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Certificación
          </button>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700 shadow-xl">
          <div className="flex gap-4 items-center">
            <label className="text-sm font-semibold text-slate-300">Filtrar por estado:</label>
            <select
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
          {!certifications || certifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No hay certificaciones registradas</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Empleado</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Solicitante</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 bg-slate-900/10">
                  {certifications.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-white">
                          {cert.employee?.firstName} {cert.employee?.lastName}
                        </div>
                        <div className="text-sm text-slate-400">{cert.employee?.identificationNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{cert.tipoCertificado}</div>
                        {cert.incluirSalario && <div className="text-xs text-orange-400 mt-1">Con salario</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{cert.requesterNombre}</div>
                        <div className="text-sm text-slate-400">{cert.requesterEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${badgeStyles[cert.estado] || badgeStyles['']}`}>
                          {statusLabels[cert.estado]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(cert.createdAt).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2 items-center">
                          {!isEmployee && cert.estado === CertificationStatus.PENDIENTE && (
                            <button
                              onClick={() => handleApprove(cert.id)}
                              className="text-green-400 hover:text-green-300"
                              title="Aprobar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m9.55 15.15l8.475-8.475q.3-.3.7-.3t.7.3t.3.713t-.3.712l-9.175 9.2q-.3.3-.7.3t-.7-.3L4.55 13q-.3-.3-.288-.712t.313-.713t.713-.3t.712.3z"/></svg>
                            </button>
                          )}

                          {!isEmployee && (cert.estado === CertificationStatus.APROBADO ||
                            cert.estado === CertificationStatus.PENDIENTE) && (
                            <button
                              onClick={() => handleGeneratePdf(cert.id)}
                              className="text-blue-400 hover:text-blue-300 flex items-center justify-center"
                              disabled={generatePdf.isPending}
                              title="Generar PDF"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20"><path fill="#fff" fillRule="evenodd" d="M5.8 14H5v1h.8c.3 0 .5-.2.5-.5s-.2-.5-.5-.5M11 2H3v16h13V7zM7.2 14.6c0 .8-.6 1.4-1.4 1.4H5v1H4v-4h1.8c.8 0 1.4.6 1.4 1.4zm4.1.5c0 1-.8 1.9-1.9 1.9H8v-4h1.4c1 0 1.9.8 1.9 1.9zM15 14h-2v1h1.5v1H13v1h-1v-4h3zm0-2H4V3h7v4h4zm-5.6 2H9v2h.4c.6 0 1-.4 1-1s-.5-1-1-1" clipRule="evenodd"/></svg>
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
                              className="text-purple-400 hover:text-purple-300"
                              title="Descargar PDF"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m12 16l-5-5l1.4-1.45l2.6 2.6V4h2v8.15l2.6-2.6L17 11zm-6 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z"/></svg>
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
    </div>
  );
}
