import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVacancy, useUpdateVacancy } from '../../hooks/useRecruitment';
import { VacancyStatus } from '../../types/recruitment';

export default function VacancyEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: vacancy, isLoading } = useVacancy(id!);
  const updateVacancy = useUpdateVacancy();

  const [formData, setFormData] = useState({
    departamento: '',
    cargo: '',
    descripcion: '',
    cantidad: 1,
    experienciaRequerida: '',
    nivelEducacion: '',
    salarioMin: 0,
    salarioMax: 0,
    habilidadesRequeridas: '',
    estado: VacancyStatus.ABIERTA,
  });

  // Cargar datos de la vacante cuando se obtengan
  useEffect(() => {
    if (vacancy) {
      setFormData({
        departamento: vacancy.departamento || '',
        cargo: vacancy.cargo || '',
        descripcion: vacancy.descripcion || '',
        cantidad: vacancy.cantidad || 1,
        experienciaRequerida: vacancy.experienciaRequerida || '',
        nivelEducacion: vacancy.nivelEducacion || '',
        salarioMin: vacancy.salarioMin || 0,
        salarioMax: vacancy.salarioMax || 0,
        habilidadesRequeridas: vacancy.habilidadesRequeridas?.join(', ') || '',
        estado: vacancy.estado || VacancyStatus.ABIERTA,
      });
    }
  }, [vacancy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateVacancy.mutateAsync({
        id: id!,
        data: {
          departamento: formData.departamento,
          cargo: formData.cargo,
          descripcion: formData.descripcion,
          salarioMin: formData.salarioMin,
          salarioMax: formData.salarioMax,
          habilidadesRequeridas: formData.habilidadesRequeridas
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          estado: formData.estado,
        },
      });

      navigate(`/recruitment/vacancies/${id}`);
    } catch (error) {
      console.error('Error al actualizar vacante:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando vacante...</div>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Vacante no encontrada
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Editar Vacante</h1>
        <p className="text-gray-600 mt-2">Modifique la información de la vacante</p>
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

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad de Posiciones *
            </label>
            <input
              type="number"
              className="input"
              value={formData.cantidad}
              onChange={(e) =>
                setFormData({ ...formData, cantidad: Number(e.target.value) })
              }
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experiencia Requerida
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: 3 años"
              value={formData.experienciaRequerida}
              onChange={(e) =>
                setFormData({ ...formData, experienciaRequerida: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel de Educación
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Profesional"
              value={formData.nivelEducacion}
              onChange={(e) =>
                setFormData({ ...formData, nivelEducacion: e.target.value })
              }
            />
          </div>
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
              step="100000"
            />
            <p className="text-sm text-gray-500 mt-1">
              ${formData.salarioMin.toLocaleString('es-CO')} COP
            </p>
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
              step="100000"
            />
            <p className="text-sm text-gray-500 mt-1">
              ${formData.salarioMax.toLocaleString('es-CO')} COP
            </p>
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
            disabled={updateVacancy.isPending}
          >
            {updateVacancy.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/recruitment/vacancies/${id}`)}
            className="btn btn-secondary flex-1"
          >
            Cancelar
          </button>
        </div>

        {updateVacancy.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error al actualizar la vacante. Por favor intente nuevamente.
          </div>
        )}

        {updateVacancy.isSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            ✓ Vacante actualizada exitosamente
          </div>
        )}
      </form>
    </div>
  );
}
