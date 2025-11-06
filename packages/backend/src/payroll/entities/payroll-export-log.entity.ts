import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { PayrollPeriod } from './payroll-period.entity';

/**
 * Entidad para logs de exportación de nómina
 * Registra archivos generados (Yéminus, Aportes en Línea, CSV, Excel)
 */
@Entity('payroll_export_log')
export class PayrollExportLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PayrollPeriod, (period) => period.exports, { nullable: false })
  @JoinColumn({ name: 'payroll_period_id' })
  period: PayrollPeriod;

  @Column({ name: 'payroll_period_id' })
  payrollPeriodId: number;

  @Column({ name: 'tipo_exportacion', type: 'varchar', length: 50 })
  tipoExportacion: string;

  @Column({ type: 'varchar', length: 20 })
  formato: string;

  @Column({ name: 'file_s3_key', type: 'varchar', length: 500, nullable: true })
  fileS3Key: string;

  @Column({ name: 'file_url', type: 'text', nullable: true })
  fileUrl: string;

  @Column({ name: 'total_registros', nullable: true })
  totalRegistros: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'exported_by' })
  exportedByUser: User;

  @Column({ name: 'exported_by', nullable: true })
  exportedBy: number;

  @Column({ name: 'exported_at', nullable: true })
  exportedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
