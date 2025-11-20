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
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-700">
          <form onSubmit={handleSubmit}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-2xl leading-6 font-bold text-white mb-6 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                    Crear Nuevo Período de Nómina
                  </h3>

                  {error && (
                    <div className="mb-4 bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
                      ⚠️ {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Tipo */}
                    <div>
                      <label htmlFor="tipo" className="block text-sm font-semibold text-slate-300 mb-2">
                        Tipo de Período *
                      </label>
                      <select
                        id="tipo"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'quincenal' | 'mensual' })}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      >
                        <option value="quincenal">Quincenal</option>
                        <option value="mensual">Mensual</option>
                      </select>
                    </div>

                    {/* Fecha Inicio */}
                    <div>
                      <label htmlFor="fechaInicio" className="block text-sm font-semibold text-slate-300 mb-2">
                        Fecha Inicio *
                      </label>
                      <input
                        type="date"
                        id="fechaInicio"
                        value={formData.fechaInicio}
                        onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        required
                      />
                    </div>

                    {/* Fecha Fin */}
                    <div>
                      <label htmlFor="fechaFin" className="block text-sm font-semibold text-slate-300 mb-2">
                        Fecha Fin *
                      </label>
                      <input
                        type="date"
                        id="fechaFin"
                        value={formData.fechaFin}
                        onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        required
                      />
                    </div>

                    {/* Descripción */}
                    <div>
                      <label htmlFor="descripcion" className="block text-sm font-semibold text-slate-300 mb-2">
                        Descripción
                      </label>
                      <input
                        type="text"
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Ej: Quincena noviembre 2024 - Primera quincena"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3 border-t border-slate-700">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:opacity-50 transition duration-200"
              >
                {loading ? '⏳ Creando...' : '✓ Crear Período'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full inline-flex justify-center rounded-lg border border-slate-600 shadow-sm px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:w-auto sm:text-sm transition duration-200"
              >
                ✕ Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
