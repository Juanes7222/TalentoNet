import apiClient from '../lib/api-client';
import type {
  CertificationRequest,
  CreateCertificationDto,
  UpdateCertificationStatusDto,
  CertificationFilters,
} from '../types/certifications';

export const certificationsService = {
  async getAll(filters?: CertificationFilters): Promise<CertificationRequest[]> {
    const { data } = await apiClient.get('/certifications', { params: filters });
    return data;
  },

  async getById(id: string): Promise<CertificationRequest> {
    const { data } = await apiClient.get(`/certifications/${id}`);
    return data;
  },

  async create(certification: CreateCertificationDto): Promise<CertificationRequest> {
    const { data } = await apiClient.post('/certifications', certification);
    return data;
  },

  async updateStatus(
    id: string,
    statusUpdate: UpdateCertificationStatusDto,
  ): Promise<CertificationRequest> {
    const { data} = await apiClient.patch(`/certifications/${id}/status`, statusUpdate);
    return data;
  },

  async generatePdf(id: string): Promise<CertificationRequest> {
    const { data } = await apiClient.post(`/certifications/${id}/generate`);
    return data;
  },

  async downloadPdf(id: string, filename: string): Promise<void> {
    const response = await apiClient.get(`/certifications/${id}/download`, {
      responseType: 'blob',
    });

    // Crear link de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
