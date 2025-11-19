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
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Nueva Vacante
          </h1>
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              disabled={createVacancy.isPending}
            >
              {createVacancy.isPending ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4m8-8h-4M4 12H0"/></svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21q-1.875 0-3.512-.712t-2.85-1.925t-1.925-2.85T3 12t.713-3.512t1.924-2.85t2.85-1.925T12 3q2.05 0 3.888.875T19 6.35V4h2v6h-6V8h2.75q-1.025-1.4-2.525-2.2T12 5Q9.075 5 7.038 7.038T5 12t2.038 4.963T12 19q2.625 0 4.588-1.7T18.9 13h2.05q-.375 3.425-2.937 5.713T12 21m2.8-4.8L11 12.4V7h2v4.6l3.2 3.2z"/></svg>
                  Crear Vacante
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/recruitment/vacancies')}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg inline-flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              Cancelar
            </button>
          </div>

          {createVacancy.isError && (
            <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              <span>Error al crear la vacante. Por favor intente nuevamente.</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
