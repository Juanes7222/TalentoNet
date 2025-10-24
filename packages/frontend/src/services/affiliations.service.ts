import apiClient from '../lib/api-client';
import {
  Affiliation,
  AffiliationLog,
  AffiliationProvider,
  CreateAffiliationDto,
  RetireAffiliationDto,
  AffiliationFilterDto,
  AffiliationReport,
  AffiliationType,
} from '../types/affiliations';

/**
 * Crear nueva afiliación con comprobante
 */
export async function createAffiliation(data: CreateAffiliationDto): Promise<Affiliation> {
  const formData = new FormData();
  formData.append('employeeId', data.employeeId);
  formData.append('tipo', data.tipo);
  formData.append('proveedor', data.proveedor);
  if (data.codigoProveedor) {
    formData.append('codigoProveedor', data.codigoProveedor);
  }
  formData.append('numeroAfiliacion', data.numeroAfiliacion);
  formData.append('fechaAfiliacion', data.fechaAfiliacion);
  formData.append('consentimientoArco', String(data.consentimientoArco));
  formData.append('comprobante', data.comprobante);

  const response = await apiClient.post('/affiliations', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Obtener todas las afiliaciones con filtros
 */
export async function getAffiliations(filters?: AffiliationFilterDto): Promise<Affiliation[]> {
  const response = await apiClient.get('/affiliations', { params: filters });
  return response.data;
}

/**
 * Obtener afiliaciones de un empleado
 */
export async function getEmployeeAffiliations(employeeId: string): Promise<Affiliation[]> {
  const response = await apiClient.get(`/employees/${employeeId}/affiliations`);
  return response.data;
}

/**
 * Obtener una afiliación por ID
 */
export async function getAffiliation(id: string): Promise<Affiliation> {
  const response = await apiClient.get(`/affiliations/${id}`);
  return response.data;
}

/**
 * Retirar afiliación
 */
export async function retireAffiliation(
  id: string,
  data: RetireAffiliationDto
): Promise<Affiliation> {
  const response = await apiClient.patch(`/affiliations/${id}/retire`, data);
  return response.data;
}

/**
 * Actualizar comprobante de afiliación
 */
export async function updateAffiliationDocument(
  id: string,
  file: File
): Promise<Affiliation> {
  const formData = new FormData();
  formData.append('comprobante', file);

  const response = await apiClient.patch(`/affiliations/${id}/document`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Obtener historial de logs
 */
export async function getAffiliationLogs(id: string): Promise<AffiliationLog[]> {
  const response = await apiClient.get(`/affiliations/${id}/logs`);
  return response.data;
}

/**
 * Obtener catálogo de proveedores
 */
export async function getProviders(tipo?: AffiliationType): Promise<AffiliationProvider[]> {
  const response = await apiClient.get('/affiliations/providers', {
    params: tipo ? { tipo } : {},
  });
  return response.data;
}

/**
 * Generar reporte de afiliaciones
 */
export async function generateReport(period?: string): Promise<AffiliationReport> {
  const response = await apiClient.get('/affiliations/report', {
    params: period ? { period } : {},
  });
  return response.data;
}
