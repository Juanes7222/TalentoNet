// Enums
export enum RequesterType {
  EMPLEADO = 'empleado',
  EXTERNO = 'externo',
  RRHH = 'rrhh',
}

export enum CertificationStatus {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  GENERADO = 'generado',
  RECHAZADO = 'rechazado',
  ENVIADO = 'enviado',
}

// Interfaces
export interface CertificationRequest {
  id: string;
  requesterNombre: string;
  requesterEmail: string;
  requesterTipo: RequesterType;
  employeeId: string;
  tipoCertificado: string;
  motivo: string;
  incluirSalario: boolean;
  incluirCargo: boolean;
  incluirTiempoServicio: boolean;
  estado: CertificationStatus;
  aprobadoPorId?: string;
  aprobadoEn?: string;
  rechazadoMotivo?: string;
  pdfUrl?: string;
  pdfS3Key?: string;
  pdfGeneratedAt?: string;
  consentimientoDatos: boolean;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    identificationNumber: string;
  };
}

// DTOs
export interface CreateCertificationDto {
  requesterNombre: string;
  requesterEmail: string;
  requesterTipo: RequesterType;
  employeeId: string;
  tipoCertificado?: string;
  motivo: string;
  incluirSalario?: boolean;
  incluirCargo?: boolean;
  incluirTiempoServicio?: boolean;
  consentimientoDatos?: boolean;
  ipAddress?: string;
}

export interface UpdateCertificationStatusDto {
  estado?: CertificationStatus;
  aprobadoPorId?: string;
  rechazadoMotivo?: string;
}

export interface CertificationFilters {
  employeeId?: string;
  estado?: CertificationStatus;
  requesterEmail?: string;
}
