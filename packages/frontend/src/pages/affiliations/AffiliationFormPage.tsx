import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateAffiliation, useProviders } from '../../hooks/useAffiliations';
import { AffiliationType, CreateAffiliationDto } from '../../types/affiliations';
import { affiliationTypeLabels } from '../../utils/affiliations.utils';

export default function AffiliationFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId') || '';

  const createAffiliation = useCreateAffiliation();
  const [selectedTipo, setSelectedTipo] = useState<AffiliationType | ''>('');
  const { data: providers } = useProviders(selectedTipo as AffiliationType);

  const [formData, setFormData] = useState({
    employeeId,
    tipo: '' as AffiliationType | '',
    proveedor: '',
    codigoProveedor: '',
    numeroAfiliacion: '',
    fechaAfiliacion: new Date().toISOString().split('T')[0],
    consentimientoArco: false,
  });

  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comprobanteFile) {
      alert('Debe adjuntar el comprobante de afiliación');
      return;
    }

    if (!formData.consentimientoArco) {
      alert('Debe confirmar el consentimiento ARCO del empleado');
      return;
    }

    try {
      const dto: CreateAffiliationDto = {
        ...formData,
        tipo: formData.tipo as AffiliationType,
        comprobante: comprobanteFile,
      };

      await createAffiliation.mutateAsync(dto);
      navigate(`/employees/${employeeId}`);
    } catch (error) {
      console.error('Error al crear afiliación:', error);
    }
  };

  const handleProviderSelect = (proveedorNombre: string) => {
    const provider = providers?.find((p) => p.nombre === proveedorNombre);
    setFormData({
      ...formData,
      proveedor: proveedorNombre,
      codigoProveedor: provider?.codigo || '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Nueva Afiliación</h1>
          <p className="text-slate-400">
            Registrar afiliación a seguridad social
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-xl space-y-6">
          {/* Tipo de afiliación */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Tipo de Afiliación *
            </label>
            <select
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={formData.tipo}
              onChange={(e) => {
                const tipo = e.target.value as AffiliationType | '';
                setFormData({ ...formData, tipo, proveedor: '', codigoProveedor: '' });
                setSelectedTipo(tipo);
              }}
              required
            >
              <option value="">Seleccione un tipo</option>
              {Object.entries(affiliationTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Proveedor */}
          {selectedTipo && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Proveedor *
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                value={formData.proveedor}
                onChange={(e) => handleProviderSelect(e.target.value)}
                required
              >
                <option value="">Seleccione un proveedor</option>
                {providers?.map((provider) => (
                  <option key={provider.id} value={provider.nombre}>
                    {provider.nombre}
                    {provider.nit && ` - NIT: ${provider.nit}`}
                  </option>
                ))}
              </select>
              <p className="text-sm text-slate-400 mt-2">
                {providers?.length || 0} proveedores disponibles
              </p>
            </div>
          )}

          {/* Número de afiliación */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Número de Afiliación *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={formData.numeroAfiliacion}
              onChange={(e) =>
                setFormData({ ...formData, numeroAfiliacion: e.target.value })
              }
              required
              placeholder="Ingrese el número de afiliación"
            />
            {providers?.find((p) => p.nombre === formData.proveedor)
              ?.numeroAfiliacionEjemplo && (
              <p className="text-sm text-slate-400 mt-2">
                Ejemplo:{' '}
                {
                  providers.find((p) => p.nombre === formData.proveedor)
                    ?.numeroAfiliacionEjemplo
                }
              </p>
            )}
          </div>

          {/* Fecha de afiliación */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Fecha de Afiliación *
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={formData.fechaAfiliacion}
              onChange={(e) =>
                setFormData({ ...formData, fechaAfiliacion: e.target.value })
              }
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Comprobante */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Comprobante de Afiliación * (PDF)
            </label>
            <input
              type="file"
              accept=".pdf"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              onChange={(e) => setComprobanteFile(e.target.files?.[0] || null)}
              required
            />
            <p className="text-sm text-slate-400 mt-2">
              Documento obligatorio para auditoría. Solo archivos PDF.
            </p>
            {comprobanteFile && (
              <p className="text-sm text-green-400 mt-2 font-semibold">
                ✓ Archivo seleccionado: {comprobanteFile.name}
              </p>
            )}
          </div>

          {/* Consentimiento ARCO */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                id="consentimiento"
                className="w-5 h-5 mt-1 bg-slate-700 border border-slate-600 rounded text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                checked={formData.consentimientoArco}
                onChange={(e) =>
                  setFormData({ ...formData, consentimientoArco: e.target.checked })
                }
                required
              />
              <label htmlFor="consentimiento" className="text-sm text-slate-300 cursor-pointer">
                <strong className="text-yellow-400">Consentimiento ARCO *</strong>
                <p className="mt-2 text-slate-400">
                  Confirmo que el empleado ha otorgado su consentimiento para el
                  tratamiento de sus datos personales de acuerdo con la Ley 1581 de
                  2012 (ARCO - Acceso, Rectificación, Cancelación y Oposición). Este
                  consentimiento incluye la recolección, almacenamiento, uso,
                  circulación y supresión de la información relacionada con su
                  afiliación a seguridad social.
                </p>
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
              disabled={createAffiliation.isPending}
            >
              {createAffiliation.isPending ? '⏳ Registrando...' : '✓ Registrar Afiliación'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
            >
              ✕ Cancelar
            </button>
          </div>

          {createAffiliation.isError && (
            <div className="bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
              ⚠️ Error: {(createAffiliation.error as Error).message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
