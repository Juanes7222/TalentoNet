import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vacanciesApi, candidatesApi, interviewsApi } from '../services/recruitment.service';
import {
  CreateVacancyDto,
  UpdateVacancyDto,
  CreateCandidateDto,
  UpdateCandidateStatusDto,
  CreateInterviewDto,
  UpdateInterviewDto,
  CandidateFilterDto,
  VacancyStatus,
} from '../types/recruitment';

// Vacancies Hooks
export const useVacancies = (estado?: VacancyStatus) => {
  return useQuery({
    queryKey: ['vacancies', estado],
    queryFn: () => vacanciesApi.getAll(estado),
  });
};

export const useVacancy = (id: string) => {
  return useQuery({
    queryKey: ['vacancy', id],
    queryFn: () => vacanciesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateVacancy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vacancy: CreateVacancyDto) => vacanciesApi.create(vacancy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
    },
  });
};

export const useUpdateVacancy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVacancyDto }) =>
      vacanciesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
      queryClient.invalidateQueries({ queryKey: ['vacancy', variables.id] });
    },
  });
};

export const useDeleteVacancy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vacanciesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] });
    },
  });
};

// Candidates Hooks
export const useCandidates = (filters?: CandidateFilterDto) => {
  return useQuery({
    queryKey: ['candidates', filters],
    queryFn: () => candidatesApi.getAll(filters),
  });
};

export const useCandidate = (id: string) => {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: () => candidatesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (candidate: CreateCandidateDto) => candidatesApi.create(candidate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
};

export const useUpdateCandidateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCandidateStatusDto }) =>
      candidatesApi.updateStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['candidateHistory', variables.id] });
    },
  });
};

export const useCandidateStateHistory = (id: string) => {
  return useQuery({
    queryKey: ['candidateHistory', id],
    queryFn: () => candidatesApi.getStateHistory(id),
    enabled: !!id,
  });
};

export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => candidatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
};

// Interviews Hooks
export const useInterviews = (candidateId?: string) => {
  return useQuery({
    queryKey: ['interviews', candidateId],
    queryFn: () => interviewsApi.getAll(candidateId),
  });
};

export const useInterview = (id: string) => {
  return useQuery({
    queryKey: ['interview', id],
    queryFn: () => interviewsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (interview: CreateInterviewDto) => interviewsApi.create(interview),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['candidate', data.candidateId] });
    },
  });
};

export const useUpdateInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInterviewDto }) =>
      interviewsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['interview', variables.id] });
    },
  });
};

export const useDeleteInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => interviewsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
};
