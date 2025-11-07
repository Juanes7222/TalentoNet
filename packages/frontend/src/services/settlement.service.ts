import apiClient from '../lib/api-client';

// ==================== TIPOS ====================

export interface ContractSettlement {
  id: string;
  contractId: string;
  employeeId: string;
  fechaLiquidacion: string;
  fechaInicioContrato: string;
  fechaFinContrato: string;
  diasTrabajados: number;
  ultimoSalario: number;
  promedioSalario: number | null;
  cesantias: number;
  interesesCesantias: number;
  primaServicios: number;
  vacaciones: number;
  indemnizacion: number;
  tipoIndemnizacion: 'sin_justa_causa' | 'terminacion_anticipada' | null;
  otrosConceptos: number;
  deducciones: number;
  totalLiquidacion: number;
  detalleJson: any;
  estado: 'borrador' | 'pendiente_aprobacion' | 'aprobado' | 'pagado' | 'rechazado';
  pdfS3Key: string | null;
  pdfUrl: string | null;
  pdfGeneradoAt: string | null;
  aprobadoPor: string | null;
  aprobadoAt: string | null;
  comentariosAprobacion: string | null;
  rechazadoPor: string | null;
  rechazadoAt: string | null;
  motivoRechazo: string | null;
  pagadoAt: string | null;
  referenciaPago: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    documentNumber: string;
  };
  contract?: {
    id: string;
    position: string;
    contractType: string;
  };
  createdByUser?: {
    id: string;
    email: string;
  };
  aprobadoPorUser?: {
    id: string;
    email: string;
  };
  rechazadoPorUser?: {
    id: string;
    email: string;
  };
  auditLogs?: SettlementAudit[];
}

export interface SettlementAudit {
  id: number;
  settlementId: string;
  campoModificado: string;
  valorAnterior: string;
  valorNuevo: string;
  justificacion: string | null;
  modificadoPor: string;
  modificadoAt: string;
  modificadoPorUser?: {
    id: string;
    email: string;
  };
}

export interface CreateSettlementDto {
  fechaLiquidacion?: string;
  tipoIndemnizacion?: 'sin_justa_causa' | 'terminacion_anticipada';
  notas?: string;
}

export interface UpdateSettlementDto {
  cesantias?: number;
  interesesCesantias?: number;
  primaServicios?: number;
  vacaciones?: number;
  indemnizacion?: number;
  otrosConceptos?: number;
  deducciones?: number;
  justificacion?: string;
  notas?: string;
}

export interface ApproveSettlementDto {
  comentarios?: string;
}

export interface RejectSettlementDto {
  motivo: string;
}

export interface MarkAsPaidDto {
  referenciaPago: string;
  fechaPago?: string;
}

// ==================== CONSTANTES ====================

export const ESTADOS_SETTLEMENT = [
  { value: 'borrador', label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
  { value: 'pendiente_aprobacion', label: 'Pendiente Aprobación', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'aprobado', label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  { value: 'pagado', label: 'Pagado', color: 'bg-blue-100 text-blue-800' },
  { value: 'rechazado', label: 'Rechazado', color: 'bg-red-100 text-red-800' },
];

export const TIPOS_INDEMNIZACION = [
  { value: 'sin_justa_causa', label: 'Despido sin Justa Causa' },
  { value: 'terminacion_anticipada', label: 'Terminación Anticipada' },
];

// ==================== FUNCIONES API ====================

/**
 * Generar liquidación para un contrato
 */
export async function generateSettlement(
  contractId: string,
  data: CreateSettlementDto,
): Promise<ContractSettlement> {
  const response = await apiClient.post(`/contracts/${contractId}/settle`, data);
  return response.data;
}

/**
 * Obtener todas las liquidaciones
 */
export async function getAllSettlements(): Promise<ContractSettlement[]> {
  const response = await apiClient.get('/contracts/settlements');
  return response.data;
}

/**
 * Obtener una liquidación por ID
 */
export async function getSettlement(id: string): Promise<ContractSettlement> {
  const response = await apiClient.get(`/contracts/settlements/${id}`);
  return response.data;
}

/**
 * Obtener liquidaciones de un empleado
 */
export async function getSettlementsByEmployee(employeeId: string): Promise<ContractSettlement[]> {
  const response = await apiClient.get(`/contracts/employees/${employeeId}/settlements`);
  return response.data;
}

/**
 * Obtener liquidación de un contrato específico
 */
export async function getSettlementByContract(contractId: string): Promise<ContractSettlement | null> {
  const response = await apiClient.get(`/contracts/${contractId}/settlement`);
  return response.data;
}

/**
 * Actualizar liquidación (ajustes manuales)
 */
export async function updateSettlement(
  id: string,
  data: UpdateSettlementDto,
): Promise<ContractSettlement> {
  const response = await apiClient.patch(`/contracts/settlements/${id}`, data);
  return response.data;
}

/**
 * Aprobar liquidación
 */
export async function approveSettlement(
  id: string,
  data: ApproveSettlementDto,
): Promise<ContractSettlement> {
  const response = await apiClient.patch(`/contracts/settlements/${id}/approve`, data);
  return response.data;
}

/**
 * Rechazar liquidación
 */
export async function rejectSettlement(
  id: string,
  data: RejectSettlementDto,
): Promise<ContractSettlement> {
  const response = await apiClient.patch(`/contracts/settlements/${id}/reject`, data);
  return response.data;
}

/**
 * Marcar como pagada
 */
export async function markSettlementAsPaid(
  id: string,
  data: MarkAsPaidDto,
): Promise<ContractSettlement> {
  const response = await apiClient.patch(`/contracts/settlements/${id}/paid`, data);
  return response.data;
}

/**
 * Descargar PDF de liquidación
 */
export async function downloadSettlementPdf(id: string): Promise<{ url: string; s3Key: string }> {
  const response = await apiClient.get(`/contracts/settlements/${id}/download`);
  return response.data;
}

// ==================== UTILIDADES ====================

/**
 * Obtener label del estado
 */
export function getEstadoLabel(estado: string): string {
  return ESTADOS_SETTLEMENT.find((e) => e.value === estado)?.label || estado;
}

/**
 * Obtener color del badge de estado
 */
export function getEstadoBadgeColor(estado: string): string {
  return ESTADOS_SETTLEMENT.find((e) => e.value === estado)?.color || 'bg-gray-100 text-gray-800';
}

/**
 * Formatear moneda colombiana
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Calcular días entre dos fechas
 */
export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Validar si el usuario puede editar la liquidación
 */
export function canEdit(settlement: ContractSettlement): boolean {
  return ['borrador', 'pendiente_aprobacion'].includes(settlement.estado);
}

/**
 * Validar si el usuario puede aprobar la liquidación
 */
export function canApprove(settlement: ContractSettlement): boolean {
  return ['borrador', 'pendiente_aprobacion'].includes(settlement.estado);
}

/**
 * Validar si el usuario puede rechazar la liquidación
 */
export function canReject(settlement: ContractSettlement): boolean {
  return ['borrador', 'pendiente_aprobacion'].includes(settlement.estado);
}

/**
 * Validar si el usuario puede marcar como pagada
 */
export function canMarkAsPaid(settlement: ContractSettlement): boolean {
  return settlement.estado === 'aprobado';
}
