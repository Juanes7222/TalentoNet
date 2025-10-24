import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../employees/employee.entity';
import { Contract } from './contract.entity';
import { User } from '../users/user.entity';

@Entity('payroll_entries')
export class PayrollEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, employee => employee.payrollEntries)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => Contract)
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Column({ name: 'contract_id' })
  contractId: string;

  @Column({ name: 'period_year' })
  periodYear: number;

  @Column({ name: 'period_month' })
  periodMonth: number;

  @Column({ name: 'base_salary', type: 'decimal', precision: 15, scale: 2 })
  baseSalary: number;

  @Column({ name: 'total_earnings', type: 'decimal', precision: 15, scale: 2 })
  totalEarnings: number;

  @Column({ name: 'health_deduction', type: 'decimal', precision: 15, scale: 2, default: 0 })
  healthDeduction: number;

  @Column({ name: 'pension_deduction', type: 'decimal', precision: 15, scale: 2, default: 0 })
  pensionDeduction: number;

  @Column({ name: 'total_deductions', type: 'decimal', precision: 15, scale: 2 })
  totalDeductions: number;

  @Column({ name: 'net_pay', type: 'decimal', precision: 15, scale: 2 })
  netPay: number;

  @Column({ default: 'draft' })
  status: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: User;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
