import { useState } from 'react';
import { createPayrollPeriod, CreatePayrollPeriodDto } from '../../../services/payroll.service';

interface CreatePeriodModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePeriodModal({ onClose, onSuccess }: CreatePeriodModalProps) {
  const [formData, setFormData] = useState<CreatePayrollPeriodDto>({
    tipo: 'quincenal',
    fechaInicio: '',
    fechaFin: '',
    descripcion: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.fechaInicio || !formData.fechaFin) {
      setError('Las fechas son obligatorias');
      return;
    }

    if (new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
      setError('La fecha fin debe ser posterior a la fecha inicio');
      return;
    }

    try {
      setLoading(true);
      await createPayrollPeriod(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el período');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Crear Nuevo Período de Nómina
                  </h3>

                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Tipo */}
                    <div>
                      <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                        Tipo de Período *
                      </label>
                      <select
                        id="tipo"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'quincenal' | 'mensual' })}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="quincenal">Quincenal</option>
                        <option value="mensual">Mensual</option>
                      </select>
                    </div>

                    {/* Fecha Inicio */}
                    <div>
                      <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">
                        Fecha Inicio *
                      </label>
                      <input
                        type="date"
                        id="fechaInicio"
                        value={formData.fechaInicio}
                        onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    {/* Fecha Fin */}
                    <div>
                      <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700">
                        Fecha Fin *
                      </label>
                      <input
                        type="date"
                        id="fechaFin"
                        value={formData.fechaFin}
                        onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    {/* Descripción */}
                    <div>
                      <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                        Descripción
                      </label>
                      <input
                        type="text"
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Ej: Quincena noviembre 2024 - Primera quincena"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Crear Período'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
