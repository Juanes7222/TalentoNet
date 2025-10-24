import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Employee } from '../../employees/employee.entity';
import { User } from '../../users/user.entity';
import { AffiliationLog } from './affiliation-log.entity';

export enum AffiliationType {
  ARL = 'ARL',
  EPS = 'EPS',
  AFP = 'AFP',
  CAJA = 'CAJA',
}

export enum AffiliationStatus {
  ACTIVO = 'activo',
  RETIRADO = 'retirado',
}

export enum IntegrationStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  MANUAL = 'manual',
}

@Entity('affiliations')
export class Affiliation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación con empleado
  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id' })
  employeeId: string;

  // Tipo de afiliación
  @Column({
    type: 'varchar',
    length: 20,
    enum: AffiliationType,
  })
  tipo: AffiliationType;

  // Proveedor
  @Column({ length: 200 })
  proveedor: string;

  @Column({ name: 'codigo_proveedor', length: 50, nullable: true })
  codigoProveedor?: string;

  // Número de afiliación (cifrado)
  @Column({ name: 'numero_afiliacion_encrypted', type: 'bytea' })
  numeroAfiliacionEncrypted: Buffer;

  // Número de afiliación en texto plano (SOLO para migración, NO usar en nuevos registros)
  @Column({ name: 'numero_afiliacion_plain', length: 100, nullable: true })
  numeroAfiliacionPlain?: string;

  // Fechas
  @Column({ name: 'fecha_afiliacion', type: 'date' })
  fechaAfiliacion: Date;

  @Column({ name: 'fecha_retiro', type: 'date', nullable: true })
  fechaRetiro?: Date;

  // Estado
  @Column({
    type: 'varchar',
    length: 20,
    enum: AffiliationStatus,
    default: AffiliationStatus.ACTIVO,
  })
  estado: AffiliationStatus;

  // Documentos
  @Column({ name: 'comprobante_s3_key', type: 'text', nullable: true })
  comprobanteS3Key?: string;

  @Column({ name: 'comprobante_url', type: 'text', nullable: true })
  comprobanteUrl?: string;

  @Column({ name: 'comprobante_filename', length: 500, nullable: true })
  comprobanteFilename?: string;

  // Consentimiento ARCO
  @Column({ name: 'consentimiento_arco', default: false })
  consentimientoArco: boolean;

  @Column({ name: 'fecha_consentimiento', type: 'timestamptz', nullable: true })
  fechaConsentimiento?: Date;

  // Integración con API externa
  @Column({ name: 'external_id', length: 100, nullable: true })
  externalId?: string;

  @Column({
    name: 'integration_status',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  integrationStatus?: IntegrationStatus;

  @Column({ name: 'integration_response', type: 'jsonb', nullable: true })
  integrationResponse?: Record<string, any>;

  // Auditoría
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdByUser?: User;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'retired_by' })
  retiredByUser?: User;

  @Column({ name: 'retired_by', nullable: true })
  retiredBy?: string;

  @Column({ name: 'retired_at', type: 'timestamptz', nullable: true })
  retiredAt?: Date;

  // Relación con logs
  @OneToMany(() => AffiliationLog, (log) => log.affiliation)
  logs: AffiliationLog[];
}
