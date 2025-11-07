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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Certificación Laboral</h1>
        <p className="text-gray-600 mt-2">Complete el formulario para solicitar una certificación</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Solicitante *
            </label>
            <input
              type="text"
              className="input"
              value={formData.requesterNombre}
              onChange={(e) => setFormData({ ...formData, requesterNombre: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email del Solicitante *
            </label>
            <input
              type="email"
              className="input"
              value={formData.requesterEmail}
              onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Empleado *
          </label>
          <select
            className="input"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Certificado
          </label>
          <select
            className="input"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo de la Solicitud *
          </label>
          <textarea
            className="input"
            rows={3}
            placeholder="Ejemplo: Trámite bancario, solicitud de crédito, etc."
            value={formData.motivo}
            onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
            required
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.incluirCargo}
              onChange={(e) => setFormData({ ...formData, incluirCargo: e.target.checked })}
            />
            <span className="text-sm">Incluir cargo actual</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.incluirTiempoServicio}
              onChange={(e) =>
                setFormData({ ...formData, incluirTiempoServicio: e.target.checked })
              }
            />
            <span className="text-sm">Incluir tiempo de servicio</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.incluirSalario}
              onChange={(e) => setFormData({ ...formData, incluirSalario: e.target.checked })}
            />
            <span className="text-sm text-orange-600 font-medium">
              Incluir información salarial (requiere consentimiento)
            </span>
          </label>

          {formData.incluirSalario && (
            <div className="ml-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={formData.consentimientoDatos}
                  onChange={(e) =>
                    setFormData({ ...formData, consentimientoDatos: e.target.checked })
                  }
                  required={formData.incluirSalario}
                />
                <span className="text-sm">
                  <strong>Consentimiento de datos sensibles:</strong> Autorizo el uso de mi
                  información salarial en este certificado. Entiendo que estos datos son
                  confidenciales.
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={createCertification.isPending}
          >
            {createCertification.isPending ? 'Creando...' : 'Solicitar Certificación'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/certifications')}
            className="btn btn-secondary flex-1"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
