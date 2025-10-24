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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Afiliación</h1>
        <p className="text-gray-600 mt-2">
          Registrar afiliación a seguridad social
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Tipo de afiliación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Afiliación *
          </label>
          <select
            className="input"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor *
            </label>
            <select
              className="input"
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
            <p className="text-sm text-gray-500 mt-1">
              {providers?.length || 0} proveedores disponibles
            </p>
          </div>
        )}

        {/* Número de afiliación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Afiliación *
          </label>
          <input
            type="text"
            className="input"
            value={formData.numeroAfiliacion}
            onChange={(e) =>
              setFormData({ ...formData, numeroAfiliacion: e.target.value })
            }
            required
            placeholder="Ingrese el número de afiliación"
          />
          {providers?.find((p) => p.nombre === formData.proveedor)
            ?.numeroAfiliacionEjemplo && (
            <p className="text-sm text-gray-500 mt-1">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Afiliación *
          </label>
          <input
            type="date"
            className="input"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comprobante de Afiliación * (PDF)
          </label>
          <input
            type="file"
            accept=".pdf"
            className="input"
            onChange={(e) => setComprobanteFile(e.target.files?.[0] || null)}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Documento obligatorio para auditoría. Solo archivos PDF.
          </p>
          {comprobanteFile && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Archivo seleccionado: {comprobanteFile.name}
            </p>
          )}
        </div>

        {/* Consentimiento ARCO */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consentimiento"
              className="mt-1"
              checked={formData.consentimientoArco}
              onChange={(e) =>
                setFormData({ ...formData, consentimientoArco: e.target.checked })
              }
              required
            />
            <label htmlFor="consentimiento" className="text-sm text-gray-700">
              <strong>Consentimiento ARCO *</strong>
              <p className="mt-1">
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
            className="btn btn-primary flex-1"
            disabled={createAffiliation.isPending}
          >
            {createAffiliation.isPending ? 'Registrando...' : 'Registrar Afiliación'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary flex-1"
          >
            Cancelar
          </button>
        </div>

        {createAffiliation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error: {(createAffiliation.error as Error).message}
          </div>
        )}
      </form>
    </div>
  );
}
