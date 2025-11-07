import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../employees/employee.entity';
import { User } from '../../users/user.entity';

export enum RequesterType {
  EMPLEADO = 'empleado',
  EXTERNO = 'externo',
  RRHH = 'rrhh',
}

export enum CertificationStatus {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  GENERADO = 'generado',
  RECHAZADO = 'rechazado',
  ENVIADO = 'enviado',
}

@Entity('certification_requests')
export class CertificationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Información del solicitante
  @Column({ name: 'requester_nombre', length: 200 })
  requesterNombre: string;

  @Column({ name: 'requester_email', length: 255 })
  requesterEmail: string;

  @Column({
    name: 'requester_tipo',
    type: 'varchar',
    length: 50,
  })
  requesterTipo: RequesterType;

  // Empleado certificado
  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id' })
  employeeId: string;

  // Detalles de la certificación
  @Column({ name: 'tipo_certificado', length: 100, default: 'laboral' })
  tipoCertificado: string;

  @Column({ type: 'text' })
  motivo: string;

  @Column({ name: 'incluir_salario', default: false })
  incluirSalario: boolean;

  @Column({ name: 'incluir_cargo', default: true })
  incluirCargo: boolean;

  @Column({ name: 'incluir_tiempo_servicio', default: true })
  incluirTiempoServicio: boolean;

  // Estado y aprobación
  @Column({
    type: 'varchar',
    length: 50,
    default: CertificationStatus.PENDIENTE,
  })
  estado: CertificationStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'aprobado_por' })
  aprobadoPor: User;

  @Column({ name: 'aprobado_por', nullable: true })
  aprobadoPorId: string;

  @Column({ name: 'aprobado_en', type: 'timestamptz', nullable: true })
  aprobadoEn: Date;

  @Column({ name: 'rechazado_motivo', type: 'text', nullable: true })
  rechazadoMotivo: string | null;

  // PDF generado
  @Column({ name: 'pdf_url', type: 'text', nullable: true })
  pdfUrl: string;

  @Column({ name: 'pdf_s3_key', length: 500, nullable: true })
  pdfS3Key: string;

  @Column({ name: 'pdf_generated_at', type: 'timestamptz', nullable: true })
  pdfGeneratedAt: Date;

  // Consentimiento datos sensibles
  @Column({ name: 'consentimiento_datos', default: false })
  consentimientoDatos: boolean;

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress: string;

  // Auditoría
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
