import { useState } from 'react';
import { markSettlementAsPaid } from '../../../services/settlement.service';

interface MarkAsPaidModalProps {
  settlementId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MarkAsPaidModal({ settlementId, onClose, onSuccess }: MarkAsPaidModalProps) {
  const [referenciaPago, setReferenciaPago] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenciaPago.trim()) {
      setError('Debe proporcionar una referencia de pago');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await markSettlementAsPaid(settlementId, { referenciaPago });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al marcar como pagada');
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
              <div className="sm:flex sm:items-start gap-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-500/20 border border-purple-500/30 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left flex-1">
                  <h3 className="text-2xl leading-6 font-bold text-white mb-2">
                    💳 Marcar como Pagada
                  </h3>

                  {error && (
                    <div className="mt-4 bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
                      ⚠️ {error}
                    </div>
                  )}

                  <div className="mt-4">
                    <p className="text-sm text-slate-400 mb-4">
                      Confirme el pago de la liquidación proporcionando la referencia de la transacción.
                    </p>

                    <div>
                      <label htmlFor="referenciaPago" className="block text-sm font-semibold text-slate-300 mb-2">
                        Referencia de Pago <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="referenciaPago"
                        type="text"
                        value={referenciaPago}
                        onChange={(e) => setReferenciaPago(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                        placeholder="Ej: TRF-2024-001234, CH-567890, etc."
                        required
                      />
                      <p className="mt-2 text-xs text-slate-400">
                        💡 Número de transferencia, cheque, comprobante de pago, etc.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3 border-t border-slate-700">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:w-auto sm:text-sm disabled:opacity-50 transition duration-200"
              >
                {loading ? '⏳ Guardando...' : '✓ Confirmar Pago'}
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
