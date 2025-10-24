import {
  AffiliationType,
  AffiliationStatus,
  AffiliationLogAction,
  IntegrationStatus,
} from '../types/affiliations';

/**
 * Labels de tipos de afiliación
 */
export const affiliationTypeLabels: Record<AffiliationType, string> = {
  [AffiliationType.ARL]: 'ARL - Riesgos Laborales',
  [AffiliationType.EPS]: 'EPS - Salud',
  [AffiliationType.AFP]: 'AFP - Pensión',
  [AffiliationType.CAJA]: 'Caja de Compensación',
};

/**
 * Labels cortos de tipos
 */
export const affiliationTypeShortLabels: Record<AffiliationType, string> = {
  [AffiliationType.ARL]: 'ARL',
  [AffiliationType.EPS]: 'EPS',
  [AffiliationType.AFP]: 'AFP',
  [AffiliationType.CAJA]: 'Caja',
};

/**
 * Labels de estados
 */
export const affiliationStatusLabels: Record<AffiliationStatus, string> = {
  [AffiliationStatus.ACTIVO]: 'Activo',
  [AffiliationStatus.RETIRADO]: 'Retirado',
};

/**
 * Labels de acciones de log
 */
export const logActionLabels: Record<AffiliationLogAction, string> = {
  [AffiliationLogAction.CREACION]: 'Creación',
  [AffiliationLogAction.ACTUALIZACION]: 'Actualización',
  [AffiliationLogAction.RETIRO]: 'Retiro',
  [AffiliationLogAction.INTEGRACION_EXITOSA]: 'Integración Exitosa',
  [AffiliationLogAction.INTEGRACION_FALLIDA]: 'Integración Fallida',
  [AffiliationLogAction.DOCUMENTO_ACTUALIZADO]: 'Documento Actualizado',
  [AffiliationLogAction.REACTIVACION]: 'Reactivación',
};

/**
 * Labels de estado de integración
 */
export const integrationStatusLabels: Record<IntegrationStatus, string> = {
  [IntegrationStatus.PENDING]: 'Pendiente',
  [IntegrationStatus.SUCCESS]: 'Exitosa',
  [IntegrationStatus.FAILED]: 'Fallida',
  [IntegrationStatus.MANUAL]: 'Manual',
};

/**
 * Colores de badges por tipo
 */
export const affiliationTypeColors: Record<AffiliationType, string> = {
  [AffiliationType.ARL]: 'bg-red-100 text-red-800',
  [AffiliationType.EPS]: 'bg-blue-100 text-blue-800',
  [AffiliationType.AFP]: 'bg-green-100 text-green-800',
  [AffiliationType.CAJA]: 'bg-purple-100 text-purple-800',
};

/**
 * Colores de badges por estado
 */
export const affiliationStatusColors: Record<AffiliationStatus, string> = {
  [AffiliationStatus.ACTIVO]: 'bg-green-100 text-green-800',
  [AffiliationStatus.RETIRADO]: 'bg-gray-100 text-gray-800',
};

/**
 * Colores de badges por estado de integración
 */
export const integrationStatusColors: Record<IntegrationStatus, string> = {
  [IntegrationStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [IntegrationStatus.SUCCESS]: 'bg-green-100 text-green-800',
  [IntegrationStatus.FAILED]: 'bg-red-100 text-red-800',
  [IntegrationStatus.MANUAL]: 'bg-gray-100 text-gray-800',
};

/**
 * Formatear fecha
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formatear fecha y hora
 */
export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Obtener icono por tipo de afiliación
 */
export function getAffiliationTypeIcon(tipo: AffiliationType): string {
  const icons = {
    [AffiliationType.ARL]: '🛡️',
    [AffiliationType.EPS]: '🏥',
    [AffiliationType.AFP]: '💰',
    [AffiliationType.CAJA]: '🎁',
  };
  return icons[tipo];
}

/**
 * Validar número de afiliación según patrón
 */
export function validateAffiliationNumber(
  numero: string,
  pattern?: string
): boolean {
  if (!pattern) return true;
  const regex = new RegExp(pattern);
  return regex.test(numero);
}

/**
 * Enmascarar número de afiliación (para mostrar parcialmente)
 */
export function maskAffiliationNumber(numero: string): string {
  if (!numero || numero.length < 4) return '****';
  const visible = numero.slice(-4);
  const masked = '*'.repeat(numero.length - 4);
  return masked + visible;
}
