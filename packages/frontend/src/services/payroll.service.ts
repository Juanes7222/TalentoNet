import apiClient from '../lib/api-client';

// ==================== TIPOS ====================

export interface PayrollPeriod {
  id: number;
  tipo: 'quincenal' | 'mensual';
  fechaInicio: string;
  fechaFin: string;
  estado: 'abierto' | 'liquidado' | 'aprobado' | 'cerrado';
  descripcion?: string;
  createdBy?: number;
  liquidatedBy?: number;
  liquidatedAt?: string;
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdByUser?: {
    id: number;
    email: string;
    name: string;
  };
  liquidatedByUser?: {
    id: number;
    email: string;
    name: string;
  };
  approvedByUser?: {
    id: number;
    email: string;
    name: string;
  };
}

export interface PayrollNovedad {
  id: number;
  employeeId: string;
  payrollPeriodId: number;
  tipo: string;
  categoria: 'devengo' | 'deduccion';
  valor: number;
  cantidad: number;
  fecha: string;
  comentario?: string;
  metadata?: any;
  createdBy?: number;
  createdAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    identificationNumber: string;
  };
}

export interface PayrollEntry {
  id: number;
  payrollPeriodId: number;
  employeeId: string;
  salarioBase: number;
  horasExtras: number;
  comisiones: number;
  bonificaciones: number;
  otrosDevengos: number;
  totalDevengado: number;
  salud: number;
  pension: number;
  fondoSolidaridad: number;
  retencionFuente: number;
  otrasDeducciones: number;
  totalDeducido: number;
  neto: number;
  detallesJson: any;
  calculatedBy?: number;
  calculatedAt: string;
  createdAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    identificationNumber: string;
  };
}

export interface CreatePayrollPeriodDto {
  tipo: 'quincenal' | 'mensual';
  fechaInicio: string;
  fechaFin: string;
  descripcion?: string;
}

export interface CreateNovedadDto {
  employeeId: string;
  tipo: string;
  categoria: 'devengo' | 'deduccion';
  valor: number;
  cantidad?: number;
  fecha?: string;
  comentario?: string;
  descripcion?: string;
  metadata?: any;
}

export interface BulkCreateNovedadesDto {
  novedades: CreateNovedadDto[];
}

export interface LiquidatePayrollDto {
  employeeIds?: string[];
}

export interface ApprovePayrollDto {
  comentario?: string;
}

export interface ClosePayrollDto {
  comentario?: string;
}

// ==================== TIPOS DE NOVEDADES ====================

export const TIPOS_NOVEDAD_DEVENGO = [
  { value: 'horas_extras_diurnas', label: 'Horas Extras Diurnas (25%)' },
  { value: 'horas_extras_nocturnas', label: 'Horas Extras Nocturnas (75%)' },
  { value: 'horas_dominicales', label: 'Horas Dominicales/Festivas (75%)' },
  { value: 'comision_ventas', label: 'Comisión por Ventas' },
  { value: 'bono_productividad', label: 'Bono por Productividad' },
  { value: 'auxilio_rodamiento', label: 'Auxilio de Rodamiento' },
  { value: 'viaticos', label: 'Viáticos' },
  { value: 'prima_extralegal', label: 'Prima Extralegal' },
];

export const TIPOS_NOVEDAD_DEDUCCION = [
  { value: 'prestamo_empresa', label: 'Préstamo Empresa' },
  { value: 'embargo_judicial', label: 'Embargo Judicial' },
  { value: 'retencion_cooperativa', label: 'Retención Cooperativa' },
  { value: 'cuota_sindical', label: 'Cuota Sindical' },
  { value: 'fondo_empleados', label: 'Fondo de Empleados' },
  { value: 'libranza', label: 'Libranza' },
  { value: 'anticipo', label: 'Anticipo de Nómina' },
];

// Combinar todos los tipos de novedad
export const TIPOS_NOVEDAD = [...TIPOS_NOVEDAD_DEVENGO, ...TIPOS_NOVEDAD_DEDUCCION];

// ==================== FUNCIONES API ====================

/**
 * Crear nuevo período de nómina
 */
export async function createPayrollPeriod(data: CreatePayrollPeriodDto): Promise<PayrollPeriod> {
  const response = await apiClient.post('/payroll/periods', data);
  return response.data;
}

/**
 * Obtener todos los períodos
 */
export async function getPayrollPeriods(): Promise<PayrollPeriod[]> {
  const response = await apiClient.get('/payroll/periods');
  return response.data;
}

/**
 * Obtener un período específico
 */
export async function getPayrollPeriod(id: number): Promise<PayrollPeriod> {
  const response = await apiClient.get(`/payroll/periods/${id}`);
  return response.data;
}

/**
 * Agregar novedad a un período
 */
export async function createNovedad(periodId: number, data: CreateNovedadDto): Promise<PayrollNovedad> {
  const response = await apiClient.post(`/payroll/periods/${periodId}/novedades`, data);
  return response.data;
}

/**
 * Carga masiva de novedades
 */
export async function bulkCreateNovedades(periodId: number, data: BulkCreateNovedadesDto): Promise<PayrollNovedad[]> {
  const response = await apiClient.post(`/payroll/periods/${periodId}/novedades/bulk`, data);
  return response.data;
}

/**
 * Obtener novedades de un período
 */
export async function getNovedades(periodId: number): Promise<PayrollNovedad[]> {
  const response = await apiClient.get(`/payroll/periods/${periodId}/novedades`);
  return response.data;
}

/**
 * Liquidar período
 */
export async function liquidatePeriod(periodId: number, data: LiquidatePayrollDto = {}): Promise<PayrollEntry[]> {
  const response = await apiClient.post(`/payroll/periods/${periodId}/liquidate`, data);
  return response.data;
}

/**
 * Obtener liquidaciones de un período
 */
export async function getPayrollEntries(periodId: number): Promise<PayrollEntry[]> {
  const response = await apiClient.get(`/payroll/periods/${periodId}/entries`);
  return response.data;
}

/**
 * Obtener liquidación de un empleado en un período
 */
export async function getPayrollEntry(periodId: number, employeeId: string): Promise<PayrollEntry> {
  const response = await apiClient.get(`/payroll/periods/${periodId}/entries/${employeeId}`);
  return response.data;
}

/**
 * Aprobar período
 */
export async function approvePeriod(periodId: number, data: ApprovePayrollDto = {}): Promise<PayrollPeriod> {
  const response = await apiClient.post(`/payroll/periods/${periodId}/approve`, data);
  return response.data;
}

/**
 * Cerrar período
 */
export async function closePeriod(periodId: number, data: ClosePayrollDto = {}): Promise<PayrollPeriod> {
  const response = await apiClient.post(`/payroll/periods/${periodId}/close`, data);
  return response.data;
}

/**
 * Utilidades para formatear valores
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getEstadoBadgeColor(estado: PayrollPeriod['estado']): string {
  switch (estado) {
    case 'abierto':
      return 'bg-blue-100 text-blue-800';
    case 'liquidado':
      return 'bg-yellow-100 text-yellow-800';
    case 'aprobado':
      return 'bg-green-100 text-green-800';
    case 'cerrado':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getEstadoLabel(estado: PayrollPeriod['estado']): string {
  switch (estado) {
    case 'abierto':
      return 'Abierto';
    case 'liquidado':
      return 'Liquidado';
    case 'aprobado':
      return 'Aprobado';
    case 'cerrado':
      return 'Cerrado';
    default:
      return estado;
  }
}


// services/payroll.service.ts - Agrega estas funciones

export interface PayrollTrendData {
  date: string;
  total: number;
  abiertos: number;
  liquidados: number;
  aprobados: number;
  cerrados: number;
}

export const getPayrollTrendData = async (days: number = 30): Promise<PayrollTrendData[]> => {
  // En una implementación real, esto vendría de tu API
  // Por ahora simulamos datos basados en el tiempo
  
  const trendData: PayrollTrendData[] = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Simular crecimiento orgánico basado en el tiempo
    const baseValue = Math.max(1, Math.floor((days - i) / 7) + 1);
    
    trendData.push({
      date: date.toISOString().split('T')[0],
      total: baseValue * 5,
      abiertos: Math.floor(baseValue * 1.2),
      liquidados: Math.floor(baseValue * 1.1),
      aprobados: Math.floor(baseValue * 0.8),
      cerrados: Math.floor(baseValue * 0.9),
    });
  }
  
  return trendData;
};

export const getRealTimeStats = async () => {
  const periods = await getPayrollPeriods();
  
  // Obtener estadísticas reales
  const realStats = {
    total: periods.length,
    abiertos: periods.filter(p => p.estado === 'abierto').length,
    liquidados: periods.filter(p => p.estado === 'liquidado').length,
    aprobados: periods.filter(p => p.estado === 'aprobado').length,
    cerrados: periods.filter(p => p.estado === 'cerrado').length,
  };

  // Generar datos de tendencia REALISTAS basados en los períodos existentes
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    
    // Para cada día, calcular cuántos períodos existían hasta esa fecha
    const periodsUntilDate = periods.filter(period => 
      new Date(period.createdAt) <= date
    );

    return {
      date: date.toISOString().split('T')[0],
      total: periodsUntilDate.length,
      abiertos: periodsUntilDate.filter(p => p.estado === 'abierto').length,
      liquidados: periodsUntilDate.filter(p => p.estado === 'liquidado').length,
      aprobados: periodsUntilDate.filter(p => p.estado === 'aprobado').length,
      cerrados: periodsUntilDate.filter(p => p.estado === 'cerrado').length,
    };
  });

  return {
    stats: realStats,
    trendData
  };
};