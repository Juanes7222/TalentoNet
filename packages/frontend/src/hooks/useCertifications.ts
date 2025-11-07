import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificationsService } from '../services/certifications.service';
import type {
  CreateCertificationDto,
  UpdateCertificationStatusDto,
  CertificationFilters,
} from '../types/certifications';

// Query keys
const certificationKeys = {
  all: ['certifications'] as const,
  lists: () => [...certificationKeys.all, 'list'] as const,
  list: (filters?: CertificationFilters) => [...certificationKeys.lists(), filters] as const,
  details: () => [...certificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...certificationKeys.details(), id] as const,
};

// Hooks
export function useCertifications(filters?: CertificationFilters) {
  return useQuery({
    queryKey: certificationKeys.list(filters),
    queryFn: () => certificationsService.getAll(filters),
  });
}

export function useCertification(id: string) {
  return useQuery({
    queryKey: certificationKeys.detail(id),
    queryFn: () => certificationsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCertificationDto) => certificationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificationKeys.lists() });
    },
  });
}

export function useUpdateCertificationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCertificationStatusDto }) =>
      certificationsService.updateStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: certificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: certificationKeys.detail(variables.id) });
    },
  });
}

export function useGeneratePdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => certificationsService.generatePdf(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: certificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: certificationKeys.detail(id) });
    },
  });
}

export function useDownloadPdf() {
  return useMutation({
    mutationFn: ({ id, filename }: { id: string; filename: string }) =>
      certificationsService.downloadPdf(id, filename),
  });
}
