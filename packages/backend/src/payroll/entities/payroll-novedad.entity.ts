import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Employee } from '../../employees/employee.entity';
import { PayrollPeriod } from './payroll-period.entity';

export type NovedadCategoria = 'devengo' | 'deduccion';

/**
 * Entidad para novedades de nómina
 * Representa valores adicionales que afectan el cálculo (horas extras, bonos, préstamos, etc.)
 */
@Entity('payroll_novedad')
export class PayrollNovedad {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Employee, { nullable: false })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => PayrollPeriod, (period) => period.novedades, { nullable: true })
  @JoinColumn({ name: 'payroll_period_id' })
  period: PayrollPeriod;

  @Column({ name: 'payroll_period_id', nullable: true })
  payrollPeriodId: number;

  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  @Column({ type: 'varchar', length: 20 })
  categoria: NovedadCategoria;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  cantidad: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
