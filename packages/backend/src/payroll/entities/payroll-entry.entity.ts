import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Employee } from '../../employees/employee.entity';
import { PayrollPeriod } from './payroll-period.entity';
import { Payslip } from './payslip.entity';

/**
 * Entidad para liquidaciones de nómina
 * Representa el cálculo final de nómina por empleado en un período
 */
@Entity('payroll_entry')
export class PayrollEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PayrollPeriod, (period) => period.entries, { nullable: false })
  @JoinColumn({ name: 'payroll_period_id' })
  period: PayrollPeriod;

  @Column({ name: 'payroll_period_id' })
  payrollPeriodId: number;

  @ManyToOne(() => Employee, { nullable: false })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id' })
  employeeId: string;

  // ========== DEVENGOS ==========
  @Column({ name: 'salario_base', type: 'decimal', precision: 15, scale: 2, default: 0 })
  salarioBase: number;

  @Column({ name: 'horas_extras', type: 'decimal', precision: 15, scale: 2, default: 0 })
  horasExtras: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  comisiones: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  bonificaciones: number;

  @Column({ name: 'otros_devengos', type: 'decimal', precision: 15, scale: 2, default: 0 })
  otrosDevengos: number;

  @Column({ name: 'total_devengado', type: 'decimal', precision: 15, scale: 2 })
  totalDevengado: number;

  // ========== DEDUCCIONES ==========
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  salud: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pension: number;

  @Column({ name: 'fondo_solidaridad', type: 'decimal', precision: 15, scale: 2, default: 0 })
  fondoSolidaridad: number;

  @Column({ name: 'retencion_fuente', type: 'decimal', precision: 15, scale: 2, default: 0 })
  retencionFuente: number;

  @Column({ name: 'otras_deducciones', type: 'decimal', precision: 15, scale: 2, default: 0 })
  otrasDeducciones: number;

  @Column({ name: 'total_deducido', type: 'decimal', precision: 15, scale: 2 })
  totalDeducido: number;

  // ========== NETO ==========
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  neto: number;

  // ========== DETALLES JSON ==========
  @Column({ name: 'detalles_json', type: 'jsonb', nullable: true })
  detallesJson: any;

  // ========== AUDITORÍA ==========
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'calculated_by' })
  calculatedByUser: User;

  @Column({ name: 'calculated_by', nullable: true })
  calculatedBy: number;

  @Column({ name: 'calculated_at', nullable: true })
  calculatedAt: Date;

  // ========== RELACIÓN CON PAYSLIP ==========
  @OneToOne(() => Payslip, (payslip) => payslip.entry)
  payslip: Payslip;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
