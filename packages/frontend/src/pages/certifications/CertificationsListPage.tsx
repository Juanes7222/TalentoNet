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
  [CertificationStatus.PENDIENTE]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  [CertificationStatus.APROBADO]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  [CertificationStatus.GENERADO]: 'bg-green-500/20 text-green-300 border-green-500/30',
  [CertificationStatus.RECHAZADO]: 'bg-red-500/20 text-red-300 border-red-500/30',
  [CertificationStatus.ENVIADO]: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
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

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleGeneratePdf = async (id: string) => {
    try {
      await generatePdf.mutateAsync(id);
      showNotification('PDF generado exitosamente. Ya puedes descargarlo.', 'success');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      showNotification('Error al generar el PDF. Intente nuevamente.', 'error');
    }
  };

  const handleDownloadPdf = async (id: string, employeeName: string) => {
    try {
      await downloadPdf.mutateAsync({
        id,
        filename: `certificacion-${employeeName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      });
      showNotification('PDF descargado correctamente.', 'success');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      showNotification('Error al descargar el PDF. Intente nuevamente.', 'error');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateStatus.mutateAsync({
        id,
        data: { estado: CertificationStatus.APROBADO },
      });
      showNotification('Certificación aprobada correctamente.', 'success');
    } catch (error) {
      console.error('Error al aprobar:', error);
      showNotification('Error al aprobar la certificación.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center">
        <div className="text-xl text-slate-300">Cargando certificaciones...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>

      {/* Toast fijo - siempre visible */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-3 duration-300">
          <div className={`backdrop-blur-xl rounded-2xl shadow-2xl border p-5 min-w-[320px] max-w-sm ${
            notification.type === 'success' 
              ? 'bg-green-500/20 border-green-500/50' 
              : notification.type === 'error'
                ? 'bg-red-500/20 border-red-500/50'
                : 'bg-orange-500/20 border-orange-500/50'
          }`}>
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                notification.type === 'success'
                  ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/50'
                  : notification.type === 'error'
                    ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50'
                    : 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-amber-500/50'
              }`}>
                {notification.type === 'success' ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : notification.type === 'error' ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg mb-1 ${
                  notification.type === 'success' ? 'text-green-300' 
                    : notification.type === 'error' ? 'text-red-300' 
                    : 'text-orange-300'
                }`}>
                  {notification.type === 'success' ? '¡Éxito!' : notification.type === 'error' ? 'Error' : 'Advertencia'}
                </h3>
                <p className="text-slate-300 text-sm">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-slate-400 hover:text-white transition-colors ml-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Certificaciones Laborales
              </h1>
              <p className="text-slate-300">Gestión de solicitudes de certificaciones</p>
            </div>
            <button 
              onClick={() => navigate('/certifications/new')} 
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="flex items-center space-x-2 relative z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Nueva Certificación</span>
              </div>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <label className="text-sm font-medium text-slate-300 shrink-0">Filtrar por estado:</label>
            <select
              className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CertificationStatus | '')}
            >
              <option value="" className="bg-slate-800">Todos los estados</option>
              <option value={CertificationStatus.PENDIENTE} className="bg-slate-800">Pendiente</option>
              <option value={CertificationStatus.APROBADO} className="bg-slate-800">Aprobado</option>
              <option value={CertificationStatus.GENERADO} className="bg-slate-800">Generado</option>
              <option value={CertificationStatus.RECHAZADO} className="bg-slate-800">Rechazado</option>
              <option value={CertificationStatus.ENVIADO} className="bg-slate-800">Enviado</option>
            </select>
            <div className="ml-auto flex items-center space-x-2 backdrop-blur-sm bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-slate-300 text-sm">
                {certifications?.length || 0} certificaciones
              </span>
            </div>
          </div>
        </div>

        {/* Lista */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {!certifications || certifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg mb-2">No hay certificaciones registradas</p>
              <p className="text-sm">Crea tu primera certificación para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Empleado</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Solicitante</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {certifications.map((cert) => (
                    <tr key={cert.id} className="group hover:bg-white/5 transition-all duration-300 transform hover:scale-[1.01]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-200">
                              {cert.employee?.firstName} {cert.employee?.lastName}
                            </div>
                            <div className="text-xs text-slate-400">{cert.employee?.identificationNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-200">{cert.tipoCertificado}</div>
                        {cert.incluirSalario && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-lg">
                            Con salario
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-200">{cert.requesterNombre}</div>
                        <div className="text-xs text-slate-400">{cert.requesterEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[cert.estado]}`}>
                          {statusLabels[cert.estado]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(cert.createdAt).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {cert.estado === CertificationStatus.PENDIENTE && (
                            <button onClick={() => handleApprove(cert.id)} className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50 rounded-xl text-green-300 hover:text-green-200 transition-all duration-300 transform hover:scale-110" title="Aprobar">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          {(cert.estado === CertificationStatus.APROBADO || cert.estado === CertificationStatus.PENDIENTE) && (
                            <button onClick={() => handleGeneratePdf(cert.id)} disabled={generatePdf.isPending} className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-blue-300 hover:text-blue-200 transition-all duration-300 transform hover:scale-110 disabled:opacity-50" title="Generar PDF">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          )}
                          {cert.pdfUrl && (
                            <button onClick={() => handleDownloadPdf(cert.id, `${cert.employee?.firstName}-${cert.employee?.lastName}`)} className="p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-xl text-purple-300 hover:text-purple-200 transition-all duration-300 transform hover:scale-110" title="Descargar PDF">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
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