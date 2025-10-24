import apiClient from '../lib/api-client';
import {
  Vacancy,
  Candidate,
  Interview,
  CandidateStateHistory,
  CreateVacancyDto,
  UpdateVacancyDto,
  CreateCandidateDto,
  UpdateCandidateStatusDto,
  CreateInterviewDto,
  UpdateInterviewDto,
  CandidateFilterDto,
  VacancyStatus,
} from '../types/recruitment';

// Vacancies API
export const vacanciesApi = {
  async getAll(estado?: VacancyStatus): Promise<Vacancy[]> {
    const params = estado ? { estado } : {};
    const { data } = await apiClient.get('/vacancies', { params });
    return data;
  },

  async getById(id: string): Promise<Vacancy> {
    const { data } = await apiClient.get(`/vacancies/${id}`);
    return data;
  },

  async create(vacancy: CreateVacancyDto): Promise<Vacancy> {
    const { data } = await apiClient.post('/vacancies', vacancy);
    return data;
  },

  async update(id: string, vacancy: UpdateVacancyDto): Promise<Vacancy> {
    const { data } = await apiClient.patch(`/vacancies/${id}`, vacancy);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/vacancies/${id}`);
  },
};

// Candidates API
export const candidatesApi = {
  async getAll(filters?: CandidateFilterDto): Promise<Candidate[]> {
    const { data } = await apiClient.get('/candidates', { params: filters });
    return data;
  },

  async getById(id: string): Promise<Candidate> {
    const { data } = await apiClient.get(`/candidates/${id}`);
    return data;
  },

  async create(candidate: CreateCandidateDto): Promise<Candidate> {
    const { data } = await apiClient.post('/candidates', candidate);
    return data;
  },

  async updateStatus(
    id: string,
    statusUpdate: UpdateCandidateStatusDto
  ): Promise<Candidate> {
    const { data } = await apiClient.patch(`/candidates/${id}/estado`, statusUpdate);
    return data;
  },

  async getStateHistory(id: string): Promise<CandidateStateHistory[]> {
    const { data } = await apiClient.get(`/candidates/${id}/historial`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/candidates/${id}`);
  },
};

// Interviews API
export const interviewsApi = {
  async getAll(candidateId?: string): Promise<Interview[]> {
    const params = candidateId ? { candidateId } : {};
    const { data } = await apiClient.get('/interviews', { params });
    return data;
  },

  async getById(id: string): Promise<Interview> {
    const { data } = await apiClient.get(`/interviews/${id}`);
    return data;
  },

  async create(interview: CreateInterviewDto): Promise<Interview> {
    const { data } = await apiClient.post('/interviews', interview);
    return data;
  },

  async update(id: string, interview: UpdateInterviewDto): Promise<Interview> {
    const { data } = await apiClient.patch(`/interviews/${id}`, interview);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/interviews/${id}`);
  },
};
