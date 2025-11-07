import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSettlement, formatCurrency, getEstadoLabel, getEstadoBadgeColor } from '../../../services/settlement.service';
import apiClient from '../../../lib/api-client';

interface Contract {
  id: string;
  position: string;
  contractType: string;
  startDate: string;
  endDate: string | null;
  salary: number;
  status: string;
  settlement?: {
    id: string;
    estado: string;
    totalLiquidacion: number;
    fechaLiquidacion: string;
  };
}

interface GenerateSettlementModalProps {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
}

export default function GenerateSettlementModal({ employeeId, employeeName, onClose }: GenerateSettlementModalProps) {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [formData, setFormData] = useState({
    fechaLiquidacion: new Date().toISOString().split('T')[0],
    tipoIndemnizacion: '' as '' | 'sin_justa_causa' | 'terminacion_anticipada',
    notas: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadContracts();
  }, [employeeId]);

  const loadContracts = async () => {
    try {
      setLoadingContracts(true);
      
      // Obtener contratos reales del empleado desde el backend
      const response = await apiClient.get(`/contracts`, {
        params: { employeeId }
      });
      
      if (response.data && response.data.length > 0) {
        // Para cada contrato, verificar si ya tiene una liquidación
        const contractsWithSettlements = await Promise.all(
          response.data.map(async (contract: Contract) => {
            try {
              const settlementResponse = await apiClient.get(`/contracts/${contract.id}/settlement`);
              return {
                ...contract,
                settlement: settlementResponse.data
              };
            } catch (err: any) {
              // Si no existe liquidación (404), es normal
              if (err.response?.status === 404) {
                return contract;
              }
              return contract;
            }
          })
        );
        
        setContracts(contractsWithSettlements);
        setSelectedContractId(contractsWithSettlements[0].id);
      } else {
        // No hay contratos registrados
        setContracts([]);
        setError('Este empleado no tiene contratos registrados en el sistema. Debe crear un contrato primero.');
      }
    } catch (err: any) {
      console.error('Error cargando contratos:', err);
      if (err.response?.status === 404) {
        setError('No se encontraron contratos para este empleado. Debe crear un contrato primero.');
      } else {
        setError('Error al cargar los contratos del empleado');
      }
      setContracts([]);
    } finally {
      setLoadingContracts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedContractId) {
      setError('Debe seleccionar un contrato');
      return;
    }

    // Verificar si el contrato seleccionado ya tiene liquidación
    const selectedContract = contracts.find(c => c.id === selectedContractId);
    if (selectedContract?.settlement) {
      setError('Este contrato ya tiene una liquidación. Use el botón "Ver Liquidación Existente".');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const dto = {
        fechaLiquidacion: formData.fechaLiquidacion,
        tipoIndemnizacion: formData.tipoIndemnizacion || undefined,
        notas: formData.notas || undefined,
      };

      const settlement = await generateSettlement(selectedContractId, dto);
      
      // Navegar a la página de detalle de la liquidación
      navigate(`/settlements/${settlement.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar liquidación');
    } finally {
      setLoading(false);
    }
  };

  const handleViewExistingSettlement = () => {
    const selectedContract = contracts.find(c => c.id === selectedContractId);
    if (selectedContract?.settlement) {
      navigate(`/settlements/${selectedContract.settlement.id}`);
    }
  };

  const selectedContract = contracts.find(c => c.id === selectedContractId);

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Generar Liquidación de Contrato
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Empleado: <strong>{employeeName}</strong>
                  </p>

                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  {loadingContracts ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Cargando contratos...</p>
                    </div>
                  ) : contracts.length === 0 ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            No hay contratos disponibles
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              Este empleado no tiene contratos registrados en el sistema. 
                              Para generar una liquidación, primero debe:
                            </p>
                            <ol className="list-decimal list-inside mt-2 space-y-1">
                              <li>Crear un contrato en el módulo de Contratos</li>
                              <li>Asociarlo a este empleado</li>
                              <li>Finalizar el contrato (si es necesario)</li>
                              <li>Luego podrá generar la liquidación</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Selección de Contrato */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contrato a Liquidar <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedContractId}
                          onChange={(e) => setSelectedContractId(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        >
                          <option value="">Seleccione un contrato</option>
                          {contracts.map((contract) => (
                            <option key={contract.id} value={contract.id}>
                              {contract.position} - {contract.contractType} - 
                              Inicio: {new Date(contract.startDate).toLocaleDateString('es-CO')}
                              {contract.endDate && ` - Fin: ${new Date(contract.endDate).toLocaleDateString('es-CO')}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Información del contrato seleccionado */}
                      {selectedContract && (
                        <>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Información del Contrato</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-500">Cargo:</span>
                                <span className="ml-2 font-medium">{selectedContract.position}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Tipo:</span>
                                <span className="ml-2 font-medium capitalize">{selectedContract.contractType}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Salario:</span>
                                <span className="ml-2 font-medium">
                                  ${selectedContract.salary.toLocaleString('es-CO')}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Estado:</span>
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                                  selectedContract.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {selectedContract.status === 'active' ? 'Activo' : 'Terminado'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Liquidación existente */}
                          {selectedContract.settlement && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                                    Este contrato ya tiene una liquidación
                                  </h4>
                                  <div className="text-sm text-blue-700 space-y-1">
                                    <div className="flex justify-between">
                                      <span>Estado:</span>
                                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getEstadoBadgeColor(selectedContract.settlement.estado)}`}>
                                        {getEstadoLabel(selectedContract.settlement.estado)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Total:</span>
                                      <span className="font-semibold">{formatCurrency(selectedContract.settlement.totalLiquidacion)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Fecha:</span>
                                      <span>{new Date(selectedContract.settlement.fechaLiquidacion).toLocaleDateString('es-CO')}</span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleViewExistingSettlement}
                                    className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  >
                                    Ver Liquidación Existente →
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Fecha de Liquidación - solo si no hay liquidación existente */}
                      {!selectedContract?.settlement && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de Liquidación <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={formData.fechaLiquidacion}
                            onChange={(e) => setFormData(prev => ({ ...prev, fechaLiquidacion: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                      )}

                      {/* Tipo de Indemnización - solo si no hay liquidación existente */}
                      {!selectedContract?.settlement && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tipo de Indemnización
                            </label>
                            <select
                              value={formData.tipoIndemnizacion}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                tipoIndemnizacion: e.target.value as '' | 'sin_justa_causa' | 'terminacion_anticipada' 
                              }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="">Sin indemnización</option>
                              <option value="sin_justa_causa">Despido sin justa causa</option>
                              <option value="terminacion_anticipada">Terminación anticipada</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                              Seleccione si aplica indemnización según el tipo de terminación
                            </p>
                          </div>

                          {/* Notas */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notas
                            </label>
                            <textarea
                              rows={3}
                              value={formData.notas}
                              onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              placeholder="Información adicional sobre la liquidación..."
                            />
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm text-blue-700">
                                  El sistema calculará automáticamente: cesantías, intereses sobre cesantías, 
                                  prima de servicios, vacaciones e indemnización (si aplica) según la legislación colombiana.
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
              {selectedContract?.settlement ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
                >
                  Cerrar
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={loading || loadingContracts || contracts.length === 0}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {loading ? 'Generando...' : 'Generar Liquidación'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
