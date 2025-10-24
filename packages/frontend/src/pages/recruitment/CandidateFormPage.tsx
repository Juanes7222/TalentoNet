import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateCandidate, useVacancies } from '../../hooks/useRecruitment';
import { CandidateStatus } from '../../types/recruitment';

export default function CandidateFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const createCandidate = useCreateCandidate();
  const { data: vacancies } = useVacancies();

  const [formData, setFormData] = useState({
    vacancyId: (location.state as any)?.vacancyId || '',
    nombre: '',
    apellido: '',
    cedula: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    estadoProceso: CandidateStatus.POSTULADO,
    notas: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCandidate.mutateAsync({
        ...formData,
        fechaNacimiento: formData.fechaNacimiento || undefined,
        notas: formData.notas || undefined,
      });

      navigate('/recruitment/candidates');
    } catch (error) {
      console.error('Error al crear candidato:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Candidato</h1>
        <p className="text-gray-600 mt-2">Complete la información del candidato</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vacante *
          </label>
          <select
            className="input"
            value={formData.vacancyId}
            onChange={(e) => setFormData({ ...formData, vacancyId: e.target.value })}
            required
          >
            <option value="">Seleccione una vacante</option>
            {vacancies?.map((vacancy) => (
              <option key={vacancy.id} value={vacancy.id}>
                {vacancy.cargo} - {vacancy.departamento}
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              className="input"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido *
            </label>
            <input
              type="text"
              className="input"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cédula *
            </label>
            <input
              type="text"
              className="input"
              value={formData.cedula}
              onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              className="input"
              placeholder="+57 300 123 4567"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              className="input"
              value={formData.fechaNacimiento}
              onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado Inicial *
          </label>
          <select
            className="input"
            value={formData.estadoProceso}
            onChange={(e) =>
              setFormData({ ...formData, estadoProceso: e.target.value as CandidateStatus })
            }
            required
          >
            <option value={CandidateStatus.POSTULADO}>Postulado</option>
            <option value={CandidateStatus.PRESELECCIONADO}>Preseleccionado</option>
            <option value={CandidateStatus.ENTREVISTADO}>Entrevistado</option>
            <option value={CandidateStatus.PRUEBAS_TECNICAS}>Pruebas Técnicas</option>
            <option value={CandidateStatus.APROBADO}>Aprobado</option>
            <option value={CandidateStatus.RECHAZADO}>Rechazado</option>
            <option value={CandidateStatus.CONTRATADO}>Contratado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas
          </label>
          <textarea
            className="input"
            rows={4}
            placeholder="Observaciones sobre el candidato..."
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={createCandidate.isPending}
          >
            {createCandidate.isPending ? 'Guardando...' : 'Registrar Candidato'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/recruitment/candidates')}
            className="btn btn-secondary flex-1"
          >
            Cancelar
          </button>
        </div>

        {createCandidate.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error al registrar el candidato. Verifique que la cédula no esté duplicada.
          </div>
        )}
      </form>
    </div>
  );
}
