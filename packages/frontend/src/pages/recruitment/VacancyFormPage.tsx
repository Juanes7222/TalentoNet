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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Vacante</h1>
        <p className="text-gray-600 mt-2">Complete la información de la vacante</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departamento *
            </label>
            <input
              type="text"
              className="input"
              value={formData.departamento}
              onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cargo *
            </label>
            <input
              type="text"
              className="input"
              value={formData.cargo}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            className="input"
            rows={5}
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salario Mínimo *
            </label>
            <input
              type="number"
              className="input"
              value={formData.salarioMin}
              onChange={(e) =>
                setFormData({ ...formData, salarioMin: Number(e.target.value) })
              }
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salario Máximo *
            </label>
            <input
              type="number"
              className="input"
              value={formData.salarioMax}
              onChange={(e) =>
                setFormData({ ...formData, salarioMax: Number(e.target.value) })
              }
              required
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Habilidades Requeridas (separadas por coma) *
          </label>
          <input
            type="text"
            className="input"
            placeholder="TypeScript, React, Node.js"
            value={formData.habilidadesRequeridas}
            onChange={(e) =>
              setFormData({ ...formData, habilidadesRequeridas: e.target.value })
            }
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Ingrese las habilidades separadas por comas
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado *
          </label>
          <select
            className="input"
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

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={createVacancy.isPending}
          >
            {createVacancy.isPending ? 'Guardando...' : 'Crear Vacante'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/recruitment/vacancies')}
            className="btn btn-secondary flex-1"
          >
            Cancelar
          </button>
        </div>

        {createVacancy.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error al crear la vacante. Por favor intente nuevamente.
          </div>
        )}
      </form>
    </div>
  );
}
