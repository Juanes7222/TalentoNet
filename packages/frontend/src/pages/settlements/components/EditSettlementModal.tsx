import { useState, useEffect } from 'react';
import { ContractSettlement, updateSettlement, formatCurrency } from '../../../services/settlement.service';

interface EditSettlementModalProps {
  settlement: ContractSettlement;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSettlementModal({ settlement, onClose, onSuccess }: EditSettlementModalProps) {
  const [formData, setFormData] = useState({
    cesantias: Number(settlement.cesantias),
    interesesCesantias: Number(settlement.interesesCesantias),
    primaServicios: Number(settlement.primaServicios),
    vacaciones: Number(settlement.vacaciones),
    indemnizacion: Number(settlement.indemnizacion),
    otrosConceptos: Number(settlement.otrosConceptos || 0),
    deducciones: Number(settlement.deducciones || 0),
    justificacion: '',
    notas: settlement.notas || '',
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const newTotal =
      formData.cesantias +
      formData.interesesCesantias +
      formData.primaServicios +
      formData.vacaciones +
      formData.indemnizacion +
      formData.otrosConceptos -
      formData.deducciones;
    setTotal(newTotal);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.justificacion.trim()) {
      setError('Debe proporcionar una justificación para los cambios');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await updateSettlement(settlement.id, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar liquidación');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: number | string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Editar Valores de Liquidación
                  </h3>

                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Cesantías */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cesantías
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cesantias}
                        onChange={(e) => handleChange('cesantias', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    {/* Intereses sobre Cesantías */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Intereses sobre Cesantías
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.interesesCesantias}
                        onChange={(e) => handleChange('interesesCesantias', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    {/* Prima de Servicios */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prima de Servicios
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.primaServicios}
                        onChange={(e) => handleChange('primaServicios', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    {/* Vacaciones */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vacaciones
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.vacaciones}
                        onChange={(e) => handleChange('vacaciones', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    {/* Indemnización */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Indemnización
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.indemnizacion}
                        onChange={(e) => handleChange('indemnizacion', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    {/* Otros Conceptos */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Otros Conceptos
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.otrosConceptos}
                        onChange={(e) => handleChange('otrosConceptos', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    {/* Deducciones */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deducciones
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.deducciones}
                        onChange={(e) => handleChange('deducciones', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    {/* Total calculado */}
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-indigo-900">Total a Pagar:</span>
                        <span className="text-2xl font-bold text-indigo-600">{formatCurrency(total)}</span>
                      </div>
                    </div>

                    {/* Justificación (obligatoria) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Justificación de Cambios <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={formData.justificacion}
                        onChange={(e) => handleChange('justificacion', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Describa el motivo de los ajustes manuales..."
                        required
                      />
                    </div>

                    {/* Notas opcionales */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas Adicionales
                      </label>
                      <textarea
                        rows={2}
                        value={formData.notas}
                        onChange={(e) => handleChange('notas', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Información adicional (opcional)..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={onClose}
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
