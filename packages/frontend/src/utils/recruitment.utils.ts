import {
  VacancyStatus,
  CandidateStatus,
  InterviewType,
  InterviewResult,
  InterviewStatus,
} from '../types/recruitment';

// Traducción de estados de vacantes
export const vacancyStatusLabels: Record<VacancyStatus, string> = {
  [VacancyStatus.ABIERTA]: 'Abierta',
  [VacancyStatus.EN_PROCESO]: 'En Proceso',
  [VacancyStatus.CERRADA]: 'Cerrada',
  [VacancyStatus.CANCELADA]: 'Cancelada',
};

export const vacancyStatusColors: Record<VacancyStatus, string> = {
  [VacancyStatus.ABIERTA]: 'bg-green-100 text-green-800',
  [VacancyStatus.EN_PROCESO]: 'bg-blue-100 text-blue-800',
  [VacancyStatus.CERRADA]: 'bg-gray-100 text-gray-800',
  [VacancyStatus.CANCELADA]: 'bg-red-100 text-red-800',
};

// Traducción de estados de candidatos
export const candidateStatusLabels: Record<CandidateStatus, string> = {
  [CandidateStatus.POSTULADO]: 'Postulado',
  [CandidateStatus.PRESELECCIONADO]: 'Preseleccionado',
  [CandidateStatus.ENTREVISTADO]: 'Entrevistado',
  [CandidateStatus.PRUEBAS_TECNICAS]: 'Pruebas Técnicas',
  [CandidateStatus.APROBADO]: 'Aprobado',
  [CandidateStatus.RECHAZADO]: 'Rechazado',
  [CandidateStatus.CONTRATADO]: 'Contratado',
};

export const candidateStatusColors: Record<CandidateStatus, string> = {
  [CandidateStatus.POSTULADO]: 'bg-blue-100 text-blue-800',
  [CandidateStatus.PRESELECCIONADO]: 'bg-indigo-100 text-indigo-800',
  [CandidateStatus.ENTREVISTADO]: 'bg-purple-100 text-purple-800',
  [CandidateStatus.PRUEBAS_TECNICAS]: 'bg-yellow-100 text-yellow-800',
  [CandidateStatus.APROBADO]: 'bg-green-100 text-green-800',
  [CandidateStatus.RECHAZADO]: 'bg-red-100 text-red-800',
  [CandidateStatus.CONTRATADO]: 'bg-emerald-100 text-emerald-800',
};

// Traducción de tipos de entrevista
export const interviewTypeLabels: Record<InterviewType, string> = {
  [InterviewType.TELEFONICA]: 'Telefónica',
  [InterviewType.PRESENCIAL]: 'Presencial',
  [InterviewType.VIRTUAL]: 'Virtual',
  [InterviewType.TECNICA]: 'Técnica',
  [InterviewType.PSICOTECNICA]: 'Psicotécnica',
};

// Traducción de resultados de entrevista
export const interviewResultLabels: Record<InterviewResult, string> = {
  [InterviewResult.PENDIENTE]: 'Pendiente',
  [InterviewResult.APROBADO]: 'Aprobado',
  [InterviewResult.RECHAZADO]: 'Rechazado',
  [InterviewResult.REAGENDAR]: 'Reagendar',
};

export const interviewResultColors: Record<InterviewResult, string> = {
  [InterviewResult.PENDIENTE]: 'bg-gray-100 text-gray-800',
  [InterviewResult.APROBADO]: 'bg-green-100 text-green-800',
  [InterviewResult.RECHAZADO]: 'bg-red-100 text-red-800',
  [InterviewResult.REAGENDAR]: 'bg-yellow-100 text-yellow-800',
};

// Traducción de estados de entrevista
export const interviewStatusLabels: Record<InterviewStatus, string> = {
  [InterviewStatus.PROGRAMADA]: 'Programada',
  [InterviewStatus.COMPLETADA]: 'Completada',
  [InterviewStatus.CANCELADA]: 'Cancelada',
  [InterviewStatus.REPROGRAMADA]: 'Reprogramada',
};

// Formateo de moneda
export const formatCurrency = (amount: number | undefined): string => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Formateo de fecha
export const formatDate = (date: string | undefined): string => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// Formateo de fecha y hora
export const formatDateTime = (date: string | undefined): string => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Calcular días desde la fecha
export const daysSince = (date: string): number => {
  const now = new Date();
  const past = new Date(date);
  const diff = now.getTime() - past.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
