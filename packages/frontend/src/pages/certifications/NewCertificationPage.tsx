import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCertification } from '../../hooks/useCertifications';
import { useEmployees } from '../../features/employees/hooks';
import { RequesterType } from '../../types/certifications';

// Componente de notificación toast
function NotificationToast({ message, type = 'success', onClose }: { 
  message: string; 
  type?: 'success' | 'error' | 'warning';
  onClose: () => void;
}) {
  const bgColors = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-600',
    error: 'bg-gradient-to-r from-red-500 to-rose-600',
    warning: 'bg-gradient-to-r from-orange-500 to-amber-600'
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    )
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`${bgColors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20 flex items-center space-x-3 min-w-80 max-w-md`}>
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white/10 rounded-lg p-1 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function NewCertificationPage() {
  const navigate = useNavigate();
  const createCertification = useCreateCertification();
  const { data: employeesData } = useEmployees({});

  const [formData, setFormData] = useState({
    requesterNombre: '',
    requesterEmail: '',
    requesterTipo: RequesterType.RRHH,
    employeeId: '',
    tipoCertificado: 'Certificado Laboral',
    motivo: '',
    incluirSalario: false,
    incluirCargo: true,
    incluirTiempoServicio: true,
    consentimientoDatos: false,
  });

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.incluirSalario && !formData.consentimientoDatos) {
      showNotification(
        'Debe aceptar el consentimiento para incluir información salarial en el certificado',
        'warning'
      );
      return;
    }

    try {
      await createCertification.mutateAsync(formData);
      showNotification('🎉 Certificación solicitada exitosamente! Será procesada en breve.');
      
      // Navegar después de un breve delay para que se vea la notificación
      setTimeout(() => {
        navigate('/certifications');
      }, 1500);
      
    } catch (error) {
      console.error('Error al solicitar certificación:', error);
      showNotification(
        '❌ Error al crear la solicitud. Por favor, intente nuevamente.',
        'error'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      </div>

      {/* Notificación Toast */}
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8 mb-8 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Nueva Certificación Laboral
              </h1>
              <p className="text-slate-300 mt-2">Complete el formulario para solicitar una certificación</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8 space-y-8">
          {/* Información del Solicitante */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-200">Información del Solicitante</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Nombre del Solicitante *
                </label>
                <input
                  type="text"
                  className="w-full backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  value={formData.requesterNombre}
                  onChange={(e) => setFormData({ ...formData, requesterNombre: e.target.value })}
                  placeholder="Ingrese nombre completo"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Email del Solicitante *
                </label>
                <input
                  type="email"
                  className="w-full backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  value={formData.requesterEmail}
                  onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Información del Empleado y Certificado */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-200">Información del Empleado</h2>
            </div>

            <div className="grid gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Empleado *
                </label>
                <select
                  className="w-full backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                >
                  <option value="" className="bg-slate-800 text-slate-300">Seleccione un empleado</option>
                  {employeesData?.data.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-slate-800 text-slate-300">
                      {emp.firstName} {emp.lastName} - {emp.identificationNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Tipo de Certificado
                </label>
                <select
                  className="w-full backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  value={formData.tipoCertificado}
                  onChange={(e) => setFormData({ ...formData, tipoCertificado: e.target.value })}
                >
                  <option className="bg-slate-800">Certificado Laboral</option>
                  <option className="bg-slate-800">Certificado Laboral con Salario</option>
                  <option className="bg-slate-800">Certificado de Ingresos</option>
                  <option className="bg-slate-800">Constancia de Tiempo de Servicio</option>
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Motivo de la Solicitud *
                </label>
                <textarea
                  className="w-full backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 resize-none"
                  rows={3}
                  placeholder="Ejemplo: Trámite bancario, solicitud de crédito, etc."
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Opciones del Certificado */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-200">Opciones del Certificado</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-3 group cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all duration-300">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.incluirCargo}
                    onChange={(e) => setFormData({ ...formData, incluirCargo: e.target.checked })}
                  />
                  <div className={`w-5 h-5 rounded border-2 transition-all duration-300 ${
                    formData.incluirCargo 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-slate-400 group-hover:border-slate-300'
                  }`}>
                    {formData.incluirCargo && (
                      <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-slate-300 group-hover:text-slate-200">Incluir cargo actual</span>
              </label>

              <label className="flex items-center space-x-3 group cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all duration-300">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.incluirTiempoServicio}
                    onChange={(e) =>
                      setFormData({ ...formData, incluirTiempoServicio: e.target.checked })
                    }
                  />
                  <div className={`w-5 h-5 rounded border-2 transition-all duration-300 ${
                    formData.incluirTiempoServicio 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-slate-400 group-hover:border-slate-300'
                  }`}>
                    {formData.incluirTiempoServicio && (
                      <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-slate-300 group-hover:text-slate-200">Incluir tiempo de servicio</span>
              </label>

              <label className="flex items-center space-x-3 group cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all duration-300">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.incluirSalario}
                    onChange={(e) => setFormData({ ...formData, incluirSalario: e.target.checked })}
                  />
                  <div className={`w-5 h-5 rounded border-2 transition-all duration-300 ${
                    formData.incluirSalario 
                      ? 'bg-orange-500 border-orange-500' 
                      : 'border-slate-400 group-hover:border-slate-300'
                  }`}>
                    {formData.incluirSalario && (
                      <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-orange-300 font-medium group-hover:text-orange-200">
                  Incluir información salarial (requiere consentimiento)
                </span>
              </label>

              {formData.incluirSalario && (
                <div className="ml-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl backdrop-blur-sm">
                  <label className="flex items-start space-x-3 group cursor-pointer">
                    <div className="relative mt-1">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.consentimientoDatos}
                        onChange={(e) =>
                          setFormData({ ...formData, consentimientoDatos: e.target.checked })
                        }
                        required={formData.incluirSalario}
                      />
                      <div className={`w-5 h-5 rounded border-2 transition-all duration-300 ${
                        formData.consentimientoDatos 
                          ? 'bg-orange-500 border-orange-500' 
                          : 'border-orange-400 group-hover:border-orange-300'
                      }`}>
                        {formData.consentimientoDatos && (
                          <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-orange-200 flex-1">
                      <strong>Consentimiento de datos sensibles:</strong> Autorizo el uso de mi
                      información salarial en este certificado. Entiendo que estos datos son
                      confidenciales.
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="group relative flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={createCertification.isPending}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="relative z-10 flex items-center justify-center space-x-2">
                {createCertification.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Solicitar Certificación</span>
                  </>
                )}
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/certifications')}
              className="flex-1 backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-slate-200 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}