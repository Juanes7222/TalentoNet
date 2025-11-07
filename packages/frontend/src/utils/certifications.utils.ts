import { CertificationStatus, RequesterType } from '../types/certifications';

export const certificationStatusLabels: Record<CertificationStatus, string> = {
  [CertificationStatus.PENDIENTE]: 'Pendiente',
  [CertificationStatus.APROBADO]: 'Aprobado',
  [CertificationStatus.GENERADO]: 'Generado',
  [CertificationStatus.RECHAZADO]: 'Rechazado',
  [CertificationStatus.ENVIADO]: 'Enviado',
};

export const certificationStatusColors: Record<CertificationStatus, string> = {
  [CertificationStatus.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
  [CertificationStatus.APROBADO]: 'bg-blue-100 text-blue-800',
  [CertificationStatus.GENERADO]: 'bg-green-100 text-green-800',
  [CertificationStatus.RECHAZADO]: 'bg-red-100 text-red-800',
  [CertificationStatus.ENVIADO]: 'bg-purple-100 text-purple-800',
};

export const requesterTypeLabels: Record<RequesterType, string> = {
  [RequesterType.EMPLEADO]: 'Empleado Actual',
  [RequesterType.EXTERNO]: 'Ex-empleado',
  [RequesterType.RRHH]: 'Recursos Humanos',
};

export const certificationTypes = [
  'Certificado Laboral',
  'Certificado Laboral con Salario',
  'Certificado de Ingresos',
  'Constancia de Tiempo de Servicio',
];
