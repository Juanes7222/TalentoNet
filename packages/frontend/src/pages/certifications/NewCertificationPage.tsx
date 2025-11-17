import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCertification } from '../../hooks/useCertifications';
import { useEmployees } from '../../features/employees/hooks';
import { RequesterType } from '../../types/certifications';

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
    } catch (error) {
      console.error('Error al solicitar certificación:', error);
      alert('Error al crear la solicitud');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">📄 Nueva Certificación Laboral</h1>
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
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.requesterEmail}
                onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Empleado *</label>
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
