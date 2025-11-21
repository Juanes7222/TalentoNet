import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCertification } from '../../hooks/useCertifications';
import { useEmployees } from '../../features/employees/hooks';
import { RequesterType } from '../../types/certifications';
import { useAuth } from '../../contexts/AuthContext';

export default function NewCertificationPage() {
  const navigate = useNavigate();
  const createCertification = useCreateCertification();
  const { user } = useAuth();
  const [currentEmployeeInfo, setCurrentEmployeeInfo] = useState<any>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(false);

  // Verificar si el usuario es empleado (no admin ni rrhh)
  const isEmployee = user?.roles?.some(role => role.name === 'employee') && 
                     !user?.roles?.some(role => role.name === 'admin' || role.name === 'rrhh');
  
  // Solo cargar empleados si NO es empleado (es admin o rrhh)
  const { data: employeesData } = useEmployees({}, { enabled: !isEmployee && !!user });

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

  // Cargar información del empleado si el usuario es empleado
  useEffect(() => {
    const loadEmployeeInfo = async () => {
      if (isEmployee && user) {
        setIsLoadingEmployee(true);
        try {
          const response = await fetch('/api/v1/employees/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
          });
          const employeeData = await response.json();
          setCurrentEmployeeInfo(employeeData);
          
          // Auto-completar el formulario con los datos del empleado
          setFormData(prev => ({
            ...prev,
            requesterNombre: user.fullName || '',
            requesterEmail: user.email || '',
            requesterTipo: RequesterType.EMPLEADO,
            employeeId: employeeData.id,
          }));
        } catch (error) {
          console.error('Error al cargar información del empleado:', error);
        } finally {
          setIsLoadingEmployee(false);
        }
      }
    };

    loadEmployeeInfo();
  }, [isEmployee, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.incluirSalario && !formData.consentimientoDatos) {
      alert('Debe aceptar el consentimiento para incluir información salarial');
      return;
    }

    try {
      await createCertification.mutateAsync(formData);
      alert('Certificación solicitada exitosamente');
      navigate('/certifications');
    } catch (error: any) {
      console.error('Error al solicitar certificación:', error);
      const errorMessage = error?.response?.data?.message || 'Error al crear la solicitud';
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 16 16"><path fill="#fff" fillRule="evenodd" d="M3.5 1.5v13h5.75a.75.75 0 0 1 0 1.5H3a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1h6.644a1 1 0 0 1 .72.305l3.355 3.476a1 1 0 0 1 .281.695V6.25a.75.75 0 0 1-1.5 0V6H9.75A1.75 1.75 0 0 1 8 4.25V1.5zm6 .07l2.828 2.93H9.75a.25.25 0 0 1-.25-.25zM13 15a.75.75 0 0 1-.75-.75v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5a.75.75 0 0 1 1.5 0v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5A.75.75 0 0 1 13 15" clipRule="evenodd"/></svg>
            Nueva Certificación Laboral</h1>
          <p className="mt-2 text-slate-400">Complete el formulario para solicitar una certificación</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Nombre del Solicitante *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.requesterNombre}
                onChange={(e) => setFormData({ ...formData, requesterNombre: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email del Solicitante *
              </label>
              <input
                type="email"
                className={`w-full px-4 py-3 ${isEmployee ? 'bg-slate-600 border-slate-500' : 'bg-slate-700 border-slate-600'} border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={formData.requesterEmail}
                onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                readOnly={isEmployee}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Empleado *</label>
            {isEmployee && currentEmployeeInfo ? (
              <div className="w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <div className="font-semibold">
                      {currentEmployeeInfo.firstName} {currentEmployeeInfo.lastName}
                    </div>
                    <div className="text-sm text-slate-300">
                      {currentEmployeeInfo.identificationNumber}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                      Tu perfil
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <select
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                required
              >
                <option value="">Seleccione un empleado</option>
                {employeesData?.data.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} - {emp.identificationNumber}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Tipo de Certificado</label>
            <select
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.tipoCertificado}
              onChange={(e) => setFormData({ ...formData, tipoCertificado: e.target.value })}
            >
              <option>Certificado Laboral</option>
              <option>Certificado Laboral con Salario</option>
              <option>Certificado de Ingresos</option>
              <option>Constancia de Tiempo de Servicio</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Motivo de la Solicitud *</label>
            <textarea
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Ejemplo: Trámite bancario, solicitud de crédito, etc."
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.incluirCargo}
                onChange={(e) => setFormData({ ...formData, incluirCargo: e.target.checked })}
                className="h-4 w-4 text-blue-500 bg-slate-700 border-slate-600 rounded"
              />
              <span className="text-sm text-slate-300">Incluir cargo actual</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.incluirTiempoServicio}
                onChange={(e) =>
                  setFormData({ ...formData, incluirTiempoServicio: e.target.checked })
                }
                className="h-4 w-4 text-blue-500 bg-slate-700 border-slate-600 rounded"
              />
              <span className="text-sm text-slate-300">Incluir tiempo de servicio</span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.incluirSalario}
                onChange={(e) => setFormData({ ...formData, incluirSalario: e.target.checked })}
                className="mt-1 h-4 w-4 text-orange-500 bg-slate-700 border-slate-600 rounded"
              />
              <div>
                <span className="text-sm text-orange-400 font-medium">Incluir información salarial (requiere consentimiento)</span>
                {formData.incluirSalario && (
                  <div className="mt-3 ml-6 p-4 bg-yellow-950/70 border border-yellow-800 rounded">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 text-blue-500 bg-slate-700 border-slate-600 rounded"
                        checked={formData.consentimientoDatos}
                        onChange={(e) =>
                          setFormData({ ...formData, consentimientoDatos: e.target.checked })
                        }
                        required={formData.incluirSalario}
                      />
                      <span className="text-sm text-yellow-200">
                        <strong>Consentimiento de datos sensibles:</strong> Autorizo el uso de mi información salarial en este certificado. Entiendo que estos datos son confidenciales.
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className="flex-1 px-5 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold shadow-lg hover:from-green-700 hover:to-green-800 disabled:opacity-60"
              disabled={createCertification.isPending}
            >
              {createCertification.isPending ? 'Creando...' : 'Solicitar Certificación'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/certifications')}
              className="flex-1 px-5 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 hover:bg-slate-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
