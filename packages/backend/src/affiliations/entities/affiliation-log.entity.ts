import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Affiliation } from './affiliation.entity';
import { User } from '../../users/user.entity';

export enum AffiliationLogAction {
  CREACION = 'creacion',
  ACTUALIZACION = 'actualizacion',
  RETIRO = 'retiro',
  INTEGRACION_EXITOSA = 'integracion_exitosa',
  INTEGRACION_FALLIDA = 'integracion_fallida',
  DOCUMENTO_ACTUALIZADO = 'documento_actualizado',
  REACTIVACION = 'reactivacion',
}

@Entity('affiliation_logs')
export class AffiliationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación con afiliación
  @ManyToOne(() => Affiliation, (affiliation) => affiliation.logs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'affiliation_id' })
  affiliation: Affiliation;

  @Column({ name: 'affiliation_id' })
  affiliationId: string;

  // Acción realizada
  @Column({
    type: 'varchar',
    length: 50,
    enum: AffiliationLogAction,
  })
  accion: AffiliationLogAction;

  // Detalle
  @Column('text', { nullable: true })
  detalle?: string;

  // Metadata adicional
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Auditoría
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario?: User;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha: Date;

  // Trazabilidad
  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;
}
