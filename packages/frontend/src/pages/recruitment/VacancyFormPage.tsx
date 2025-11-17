import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateVacancy } from '../../hooks/useRecruitment';
import { VacancyStatus } from '../../types/recruitment';

export default function VacancyFormPage() {
  const navigate = useNavigate();
  const createVacancy = useCreateVacancy();

  const [formData, setFormData] = useState({
    departamento: '',
    cargo: '',
    descripcion: '',
    salarioMin: 0,
    salarioMax: 0,
    habilidadesRequeridas: '',
    estado: VacancyStatus.ABIERTA,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createVacancy.mutateAsync({
        ...formData,
        habilidadesRequeridas: formData.habilidadesRequeridas
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });

      navigate('/recruitment/vacancies');
    } catch (error) {
      console.error('Error al crear vacante:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">➕ Nueva Vacante</h1>
          <p className="text-slate-400 mt-2">Complete la información de la vacante</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Departamento *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                value={formData.departamento}
                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                placeholder="Ej: Recursos Humanos"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cargo *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                placeholder="Ej: Desarrollador Senior"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descripción *
            </label>
            <textarea
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              rows={5}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Describa los detalles del puesto..."
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Salario Mínimo *
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                value={formData.salarioMin}
                onChange={(e) =>
                  setFormData({ ...formData, salarioMin: Number(e.target.value) })
                }
                placeholder="0"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Salario Máximo *
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                value={formData.salarioMax}
                onChange={(e) =>
                  setFormData({ ...formData, salarioMax: Number(e.target.value) })
                }
                placeholder="0"
                required
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Habilidades Requeridas (separadas por coma) *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="TypeScript, React, Node.js"
              value={formData.habilidadesRequeridas}
              onChange={(e) =>
                setFormData({ ...formData, habilidadesRequeridas: e.target.value })
              }
              required
            />
            <p className="text-sm text-slate-500 mt-1">
              Ingrese las habilidades separadas por comas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Estado *
            </label>
            <select
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={formData.estado}
              onChange={(e) =>
                setFormData({ ...formData, estado: e.target.value as VacancyStatus })
              }
              required
            >
              <option value={VacancyStatus.ABIERTA}>Abierta</option>
              <option value={VacancyStatus.EN_PROCESO}>En Proceso</option>
              <option value={VacancyStatus.CERRADA}>Cerrada</option>
              <option value={VacancyStatus.CANCELADA}>Cancelada</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-700">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed"
              disabled={createVacancy.isPending}
            >
              {createVacancy.isPending ? '⏳ Guardando...' : '✓ Crear Vacante'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/recruitment/vacancies')}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
            >
              ✕ Cancelar
            </button>
          </div>

          {createVacancy.isError && (
            <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
              ⚠️ Error al crear la vacante. Por favor intente nuevamente.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
