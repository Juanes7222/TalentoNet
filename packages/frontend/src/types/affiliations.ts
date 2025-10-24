// Enums
export enum AffiliationType {
  ARL = 'ARL',
  EPS = 'EPS',
  AFP = 'AFP',
  CAJA = 'CAJA',
}

export enum AffiliationStatus {
  ACTIVO = 'activo',
  RETIRADO = 'retirado',
}

export enum IntegrationStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  MANUAL = 'manual',
}

export enum AffiliationLogAction {
  CREACION = 'creacion',
  ACTUALIZACION = 'actualizacion',
  RETIRO = 'retiro',
  INTEGRACION_EXITOSA = 'integracion_exitosa',
  INTEGRACION_FALLIDA = 'integracion_fallida',
  DOCUMENTO_ACTUALIZADO = 'documento_actualizado',
  REACTIVACION = 'reactivacion',
}

// Interfaces
export interface Affiliation {
  id: string;
  employeeId: string;
  tipo: AffiliationType;
  proveedor: string;
  codigoProveedor?: string;
  numeroAfiliacionEncrypted: string;
  numeroAfiliacionDecrypted?: string; // Solo para usuarios autorizados
  fechaAfiliacion: string;
  fechaRetiro?: string;
  estado: AffiliationStatus;
  comprobanteS3Key?: string;
  comprobanteUrl?: string;
  comprobanteFilename?: string;
  consentimientoArco: boolean;
  fechaConsentimiento?: string;
  externalId?: string;
  integrationStatus?: IntegrationStatus;
  integrationResponse?: Record<string, any>;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  retiredBy?: string;
  retiredAt?: string;
  
  // Relaciones
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    identificationNumber: string;
  };
  createdByUser?: {
    id: string;
    email: string;
  };
  logs?: AffiliationLog[];
}

export interface AffiliationLog {
  id: string;
  affiliationId: string;
  accion: AffiliationLogAction;
  detalle?: string;
  metadata?: Record<string, any>;
  usuarioId?: string;
  fecha: string;
  ipAddress?: string;
  userAgent?: string;
  
  // Relaciones
  usuario?: {
    id: string;
    email: string;
  };
}

export interface AffiliationProvider {
  id: string;
  tipo: AffiliationType;
  nombre: string;
  nit?: string;
  codigo?: string;
  email?: string;
  telefono?: string;
  website?: string;
  apiEnabled: boolean;
  apiEndpoint?: string;
  numeroAfiliacionPattern?: string;
  numeroAfiliacionEjemplo?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

// DTOs para formularios
export interface CreateAffiliationDto {
  employeeId: string;
  tipo: AffiliationType;
  proveedor: string;
  codigoProveedor?: string;
  numeroAfiliacion: string;
  fechaAfiliacion: string;
  consentimientoArco: boolean;
  comprobante: File;
}

export interface RetireAffiliationDto {
  fechaRetiro?: string;
  comentario?: string;
}

export interface AffiliationFilterDto {
  tipo?: AffiliationType;
  estado?: AffiliationStatus;
  proveedor?: string;
  period?: string; // formato YYYY-MM
}

// Reporte
export interface AffiliationReport {
  period: string;
  generatedAt: string;
  data: {
    tipo: AffiliationType;
    proveedor: string;
    estado: AffiliationStatus;
    total: number;
  }[];
  summary: {
    totalActivas: number;
    totalRetiradas: number;
  };
}
