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
    ciudad: '',
    departamento: '',
    direccion: '',
    estadoProceso: CandidateStatus.POSTULADO,
    notas: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCandidate.mutateAsync({
        ...formData,
        fechaNacimiento: formData.fechaNacimiento || undefined,
        ciudad: formData.ciudad || undefined,
        departamento: formData.departamento || undefined,
        direccion: formData.direccion || undefined,
        notas: formData.notas || undefined,
      });

      navigate('/recruitment/candidates');
    } catch (error) {
      console.error('Error al crear candidato:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">➕ Nuevo Candidato</h1>
          <p className="text-slate-400 mt-2">Complete la información del candidato</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Vacante *
            </label>
            <select
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Juan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Pérez"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cédula *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                placeholder="1234567890"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="+57 300 123 4567"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="juan@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Bogotá"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Departamento
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Cundinamarca"
                value={formData.departamento}
                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Dirección
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Calle 123 #45-67"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Estado Inicial *
            </label>
            <select
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notas
            </label>
            <textarea
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
    </div>
  );
}
