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
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-slate-700">
          <form onSubmit={handleSubmit}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="mb-6">
                <h3 className="text-2xl leading-6 font-bold text-white mb-1">
                  ✏️ Editar Valores de Liquidación
                </h3>
                <p className="text-sm text-slate-400">
                  Ajuste los valores de la liquidación con justificación
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
                  ⚠️ {error}
                </div>
              )}

              <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
                {/* Cesantías */}
                <div>
                  <label htmlFor="cesantias" className="block text-sm font-semibold text-slate-300 mb-2">
                    Cesantías
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-sm">$</span>
                    </div>
                    <input
                      id="cesantias"
                      type="number"
                      step="0.01"
                      value={formData.cesantias}
                      onChange={(e) => handleChange('cesantias', parseFloat(e.target.value) || 0)}
                      className="block w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                  </div>
                </div>

                {/* Intereses sobre Cesantías */}
                <div>
                  <label htmlFor="interesesCesantias" className="block text-sm font-semibold text-slate-300 mb-2">
                    Intereses sobre Cesantías
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-sm">$</span>
                    </div>
                    <input
                      id="interesesCesantias"
                      type="number"
                      step="0.01"
                      value={formData.interesesCesantias}
                      onChange={(e) => handleChange('interesesCesantias', parseFloat(e.target.value) || 0)}
                      className="block w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                  </div>
                </div>

                {/* Prima de Servicios */}
                <div>
                  <label htmlFor="primaServicios" className="block text-sm font-semibold text-slate-300 mb-2">
                    Prima de Servicios
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-sm">$</span>
                    </div>
                    <input
                      id="primaServicios"
                      type="number"
                      step="0.01"
                      value={formData.primaServicios}
                      onChange={(e) => handleChange('primaServicios', parseFloat(e.target.value) || 0)}
                      className="block w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                  </div>
                </div>

                {/* Vacaciones */}
                <div>
                  <label htmlFor="vacaciones" className="block text-sm font-semibold text-slate-300 mb-2">
                    Vacaciones
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-sm">$</span>
                    </div>
                    <input
                      id="vacaciones"
                      type="number"
                      step="0.01"
                      value={formData.vacaciones}
                      onChange={(e) => handleChange('vacaciones', parseFloat(e.target.value) || 0)}
                      className="block w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                  </div>
                </div>

                {/* Indemnización */}
                <div>
                  <label htmlFor="indemnizacion" className="block text-sm font-semibold text-slate-300 mb-2">
                    Indemnización
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-sm">$</span>
                    </div>
                    <input
                      id="indemnizacion"
                      type="number"
                      step="0.01"
                      value={formData.indemnizacion}
                      onChange={(e) => handleChange('indemnizacion', parseFloat(e.target.value) || 0)}
                      className="block w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                  </div>
                </div>

                {/* Otros Conceptos */}
                <div>
                  <label htmlFor="otrosConceptos" className="block text-sm font-semibold text-slate-300 mb-2">
                    Otros Conceptos
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-sm">$</span>
                    </div>
                    <input
                      id="otrosConceptos"
                      type="number"
                      step="0.01"
                      value={formData.otrosConceptos}
                      onChange={(e) => handleChange('otrosConceptos', parseFloat(e.target.value) || 0)}
                      className="block w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                  </div>
                </div>

                {/* Deducciones */}
                <div>
                  <label htmlFor="deducciones" className="block text-sm font-semibold text-slate-300 mb-2">
                    Deducciones
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-sm">$</span>
                    </div>
                    <input
                      id="deducciones"
                      type="number"
                      step="0.01"
                      value={formData.deducciones}
                      onChange={(e) => handleChange('deducciones', parseFloat(e.target.value) || 0)}
                      className="block w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                  </div>
                </div>

                {/* Total calculado */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 rounded-lg border border-blue-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-blue-200">💰 Total a Pagar:</span>
                    <span className="text-2xl font-bold text-blue-400">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Justificación (obligatoria) */}
                <div>
                  <label htmlFor="justificacion" className="block text-sm font-semibold text-slate-300 mb-2">
                    Justificación de Cambios <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="justificacion"
                    rows={3}
                    value={formData.justificacion}
                    onChange={(e) => handleChange('justificacion', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Describa el motivo de los ajustes manuales..."
                    required
                  />
                </div>

                {/* Notas opcionales */}
                <div>
                  <label htmlFor="notas" className="block text-sm font-semibold text-slate-300 mb-2">
                    Notas Adicionales
                  </label>
                  <textarea
                    id="notas"
                    rows={2}
                    value={formData.notas}
                    onChange={(e) => handleChange('notas', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Información adicional (opcional)..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3 border-t border-slate-700">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:opacity-50 transition duration-200"
              >
                {loading ? '⏳ Guardando...' : '✓ Guardar Cambios'}
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
