// Enums
export enum VacancyStatus {
  ABIERTA = 'abierta',
  EN_PROCESO = 'en_proceso',
  CERRADA = 'cerrada',
  CANCELADA = 'cancelada',
}

export enum CandidateStatus {
  POSTULADO = 'postulado',
  PRESELECCIONADO = 'preseleccionado',
  ENTREVISTADO = 'entrevistado',
  PRUEBAS_TECNICAS = 'pruebas_tecnicas',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
  CONTRATADO = 'contratado',
}

export enum InterviewType {
  TELEFONICA = 'telefonica',
  PRESENCIAL = 'presencial',
  VIRTUAL = 'virtual',
  TECNICA = 'tecnica',
  PSICOTECNICA = 'psicotecnica',
}

export enum InterviewResult {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
  REAGENDAR = 'reagendar',
}

export enum InterviewStatus {
  PROGRAMADA = 'programada',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  REPROGRAMADA = 'reprogramada',
}

// Interfaces
export interface Vacancy {
  id: string;
  departamento: string;
  cargo: string;
  descripcion: string;
  cantidad: number;
  experienciaRequerida?: string;
  nivelEducacion?: string;
  habilidadesRequeridas?: string[];
  salarioMin?: number;
  salarioMax?: number;
  fechaSolicitud: string;
  fechaCierre?: string;
  estado: VacancyStatus;
  creadorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  vacancyId: string;
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  telefono: string;
  fechaNacimiento?: string;
  experienciaAnios?: number;
  ultimoCargo?: string;
  ultimaEmpresa?: string;
  nivelEducacion?: string;
  expectativaSalarial?: number;
  disponibilidad?: string;
  fechaPostulacion: string;
  estadoProceso: CandidateStatus;
  notas?: string;
  puntuacion?: number;
  createdAt: string;
  updatedAt: string;
  vacancy?: Vacancy;
  interviews?: Interview[];
}

export interface Interview {
  id: string;
  candidateId: string;
  fecha: string;
  duracionMinutos: number;
  entrevistadorId: string;
  tipo: InterviewType;
  resultado?: InterviewResult;
  puntuacion?: number;
  notas?: string;
  fortalezas?: string[];
  debilidades?: string[];
  estado: InterviewStatus;
  createdAt: string;
  updatedAt: string;
  candidate?: Candidate;
}

export interface CandidateStateHistory {
  id: string;
  candidateId: string;
  estadoAnterior: string;
  estadoNuevo: string;
  usuarioId: string;
  fecha: string;
  comentario?: string;
  ipAddress?: string;
  userAgent?: string;
}

// DTOs
export interface CreateVacancyDto {
  departamento: string;
  cargo: string;
  descripcion: string;
  salarioMin: number;
  salarioMax: number;
  habilidadesRequeridas: string[];
  estado?: VacancyStatus;
}

export interface UpdateVacancyDto extends Partial<CreateVacancyDto> {}

export interface CreateCandidateDto {
  vacancyId: string;
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  telefono: string;
  fechaNacimiento?: string;
  estadoProceso?: CandidateStatus;
  notas?: string;
}

export interface UpdateCandidateStatusDto {
  estado: CandidateStatus;
  comentario?: string;
}

export interface CreateInterviewDto {
  candidateId: string;
  tipo: InterviewType;
  fecha: string;
  estado?: InterviewStatus;
  resultado?: InterviewResult;
  fortalezas?: string[];
  debilidades?: string[];
  notas?: string;
}

export interface UpdateInterviewDto extends Partial<CreateInterviewDto> {}

export interface CandidateFilterDto {
  vacancyId?: string;
  estado?: CandidateStatus;
  search?: string;
}
