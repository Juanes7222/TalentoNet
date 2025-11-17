import { useState, useEffect } from 'react';
import { createNovedad, TIPOS_NOVEDAD } from '../../../services/payroll.service';
import { getEmployees, Employee } from '../../../services/employee.service';

interface AddNovedadModalProps {
  periodId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddNovedadModal({ periodId, onClose, onSuccess }: AddNovedadModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    tipo: '',
    categoria: 'devengo' as 'devengo' | 'deduccion',
    valor: '',
    cantidad: '1',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      
      // Solicitar TODOS los empleados activos sin límite de paginación
      const data = await getEmployees({ 
        status: 'active',
        limit: 1000, // Límite alto para obtener todos los empleados
      });
      console.log('Empleados recibidos:', data); // Para debugging
      
      // Si data es un objeto con propiedad 'data', extraerla
      const employeesArray = Array.isArray(data) ? data : (data as any).data || [];
      
      console.log('Empleados activos:', employeesArray); // Para debugging
      setEmployees(employeesArray);
      
    } catch (error) {
      console.error('Error cargando empleados:', error);
      alert('Error al cargar la lista de empleados. Por favor, intenta de nuevo.');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) newErrors.employeeId = 'Debe seleccionar un empleado';
    if (!formData.tipo) newErrors.tipo = 'Debe seleccionar un tipo de novedad';
    if (!formData.valor || Number(formData.valor) <= 0) newErrors.valor = 'El valor debe ser mayor a 0';
    if (!formData.cantidad || Number(formData.cantidad) <= 0) newErrors.cantidad = 'La cantidad debe ser mayor a 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await createNovedad(periodId, {
        employeeId: formData.employeeId,
        tipo: formData.tipo,
        categoria: formData.categoria,
        valor: Number(formData.valor),
        cantidad: Number(formData.cantidad),
        fecha: new Date(formData.fecha).toISOString(),
        comentario: formData.descripcion || undefined,
      });
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al crear la novedad');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar tipos de novedad según categoría
  const tiposDisponibles = TIPOS_NOVEDAD.filter((tipo: { value: string; label: string }) => {
    if (formData.categoria === 'devengo') {
      return ['horas_extras_diurnas', 'horas_extras_nocturnas', 'horas_dominicales', 'comision_ventas', 'bono_productividad', 'auxilio_rodamiento', 'viaticos', 'prima_extralegal'].includes(tipo.value);
    } else {
      return ['prestamo_empresa', 'embargo_judicial', 'retencion_cooperativa', 'cuota_sindical', 'fondo_empleados', 'libranza', 'anticipo'].includes(tipo.value);
    }
  });

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-700">
          <form onSubmit={handleSubmit}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl leading-6 font-bold text-white">➕ Agregar Novedad</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-300 transition"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Empleado */}
                <div>
                  <label htmlFor="employeeId" className="block text-sm font-semibold text-slate-300 mb-2">
                    Empleado *
                  </label>
                  <select
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-700 border ${errors.employeeId ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                    disabled={loadingEmployees}
                    className={`mt-1 block w-full border ${errors.employeeId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100`}
                  >
                    <option value="">
                      {loadingEmployees ? 'Cargando empleados...' : 'Seleccionar empleado'}
                    </option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} - {emp.identificationNumber}
                      </option>
                    ))}
                  </select>
                  {errors.employeeId && <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>}
                  {!loadingEmployees && employees.length === 0 && (
                    <p className="mt-1 text-sm text-amber-600">No hay empleados activos disponibles</p>
                  )}
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Categoría *</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="devengo"
                        checked={formData.categoria === 'devengo'}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value as 'devengo', tipo: '' })}
                        className="w-4 h-4 bg-slate-700 border-slate-600 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-slate-300">📈 Devengo</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="deduccion"
                        checked={formData.categoria === 'deduccion'}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value as 'deduccion', tipo: '' })}
                        className="w-4 h-4 bg-slate-700 border-slate-600 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-slate-300">📉 Deducción</span>
                    </label>
                  </div>
                </div>

                {/* Tipo */}
                <div>
                  <label htmlFor="tipo" className="block text-sm font-semibold text-slate-300 mb-2">
                    Tipo *
                  </label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-700 border ${errors.tipo ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposDisponibles.map((tipo: { value: string; label: string }) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                  {errors.tipo && <p className="mt-1 text-sm text-red-400">⚠️ {errors.tipo}</p>}
                </div>

                {/* Valor */}
                <div>
                  <label htmlFor="valor" className="block text-sm font-semibold text-slate-300 mb-2">
                    Valor *
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="valor"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      className={`block w-full pl-8 pr-4 py-3 bg-slate-700 border ${errors.valor ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  {errors.valor && <p className="mt-1 text-sm text-red-400">⚠️ {errors.valor}</p>}
                </div>

                {/* Cantidad */}
                <div>
                  <label htmlFor="cantidad" className="block text-sm font-semibold text-slate-300 mb-2">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    id="cantidad"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                    className={`w-full px-4 py-3 bg-slate-700 border ${errors.cantidad ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                    placeholder="1"
                    step="0.01"
                  />
                  {errors.cantidad && <p className="mt-1 text-sm text-red-400">⚠️ {errors.cantidad}</p>}
                  <p className="mt-2 text-xs text-slate-400">
                    💰 Total: ${(Number(formData.valor) * Number(formData.cantidad)).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Descripción */}
                <div>
                  <label htmlFor="descripcion" className="block text-sm font-semibold text-slate-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Información adicional sobre la novedad"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3 border-t border-slate-700">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm disabled:opacity-50 transition duration-200"
              >
                {loading ? '⏳ Guardando...' : '✓ Guardar'}
              </button>
              <button
                type="button"
                onClick={onClose}
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
