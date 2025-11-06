import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { PayrollEntry } from './payroll-entry.entity';
import { PayrollNovedad } from './payroll-novedad.entity';
import { PayrollExportLog } from './payroll-export-log.entity';

export type PayrollPeriodType = 'quincenal' | 'mensual';
export type PayrollPeriodEstado = 'abierto' | 'liquidado' | 'cerrado' | 'aprobado';

/**
 * Entidad para períodos de nómina
 * Representa un período de liquidación (quincenal o mensual)
 */
@Entity('payroll_period')
export class PayrollPeriod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  tipo: PayrollPeriodType;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin: Date;

  @Column({ type: 'varchar', length: 20, default: 'abierto' })
  estado: PayrollPeriodEstado;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  // Relaciones - Usuario que creó
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  // Relaciones - Usuario que liquidó
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'liquidated_by' })
  liquidatedByUser: User;

  @Column({ name: 'liquidated_by', nullable: true })
  liquidatedBy: number;

  @Column({ name: 'liquidated_at', nullable: true })
  liquidatedAt: Date;

  // Relaciones - Usuario que aprobó
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedByUser: User;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: number;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  // Relaciones inversas
  @OneToMany(() => PayrollEntry, (entry) => entry.period)
  entries: PayrollEntry[];

  @OneToMany(() => PayrollNovedad, (novedad) => novedad.period)
  novedades: PayrollNovedad[];

  @OneToMany(() => PayrollExportLog, (log) => log.period)
  exports: PayrollExportLog[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
