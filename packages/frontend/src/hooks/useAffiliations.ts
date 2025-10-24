import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAffiliation,
  getAffiliations,
  getEmployeeAffiliations,
  getAffiliation,
  retireAffiliation,
  updateAffiliationDocument,
  getAffiliationLogs,
  getProviders,
  generateReport,
} from '../services/affiliations.service';
import {
  CreateAffiliationDto,
  RetireAffiliationDto,
  AffiliationFilterDto,
  AffiliationType,
} from '../types/affiliations';

// Query keys
export const affiliationsKeys = {
  all: ['affiliations'] as const,
  lists: () => [...affiliationsKeys.all, 'list'] as const,
  list: (filters?: AffiliationFilterDto) => [...affiliationsKeys.lists(), filters] as const,
  employee: (employeeId: string) => [...affiliationsKeys.all, 'employee', employeeId] as const,
  details: () => [...affiliationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...affiliationsKeys.details(), id] as const,
  logs: (id: string) => [...affiliationsKeys.detail(id), 'logs'] as const,
  providers: (tipo?: AffiliationType) => ['providers', tipo] as const,
  report: (period?: string) => ['affiliations', 'report', period] as const,
};

/**
 * Hook para listar afiliaciones con filtros
 */
export function useAffiliations(filters?: AffiliationFilterDto) {
  return useQuery({
    queryKey: affiliationsKeys.list(filters),
    queryFn: () => getAffiliations(filters),
  });
}

/**
 * Hook para obtener afiliaciones de un empleado
 */
export function useEmployeeAffiliations(employeeId: string) {
  return useQuery({
    queryKey: affiliationsKeys.employee(employeeId),
    queryFn: () => getEmployeeAffiliations(employeeId),
    enabled: !!employeeId,
  });
}

/**
 * Hook para obtener una afiliación por ID
 */
export function useAffiliation(id: string) {
  return useQuery({
    queryKey: affiliationsKeys.detail(id),
    queryFn: () => getAffiliation(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener logs de una afiliación
 */
export function useAffiliationLogs(id: string) {
  return useQuery({
    queryKey: affiliationsKeys.logs(id),
    queryFn: () => getAffiliationLogs(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener proveedores
 */
export function useProviders(tipo?: AffiliationType) {
  return useQuery({
    queryKey: affiliationsKeys.providers(tipo),
    queryFn: () => getProviders(tipo),
  });
}

/**
 * Hook para generar reporte
 */
export function useAffiliationReport(period?: string) {
  return useQuery({
    queryKey: affiliationsKeys.report(period),
    queryFn: () => generateReport(period),
  });
}

/**
 * Hook para crear afiliación
 */
export function useCreateAffiliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAffiliationDto) => createAffiliation(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: affiliationsKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: affiliationsKeys.employee(variables.employeeId) 
      });
    },
  });
}

/**
 * Hook para retirar afiliación
 */
export function useRetireAffiliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RetireAffiliationDto }) =>
      retireAffiliation(id, data),
    onSuccess: (affiliation) => {
      queryClient.invalidateQueries({ queryKey: affiliationsKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: affiliationsKeys.employee(affiliation.employeeId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: affiliationsKeys.detail(affiliation.id) 
      });
    },
  });
}

/**
 * Hook para actualizar comprobante
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      updateAffiliationDocument(id, file),
    onSuccess: (affiliation) => {
      queryClient.invalidateQueries({ 
        queryKey: affiliationsKeys.detail(affiliation.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: affiliationsKeys.employee(affiliation.employeeId) 
      });
    },
  });
}
