import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Employee } from '../../employees/employee.entity';
import { PayrollEntry } from './payroll-entry.entity';

/**
 * Entidad para desprendibles de pago (PDF)
 * Almacena la información del archivo generado
 */
@Entity('payslip')
export class Payslip {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => PayrollEntry, (entry) => entry.payslip, { nullable: false })
  @JoinColumn({ name: 'payroll_entry_id' })
  entry: PayrollEntry;

  @Column({ name: 'payroll_entry_id' })
  payrollEntryId: number;

  @ManyToOne(() => Employee, { nullable: false })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ name: 'pdf_s3_key', type: 'varchar', length: 500, nullable: true })
  pdfS3Key: string;

  @Column({ name: 'pdf_url', type: 'text', nullable: true })
  pdfUrl: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'generated_by' })
  generatedByUser: User;

  @Column({ name: 'generated_by', nullable: true })
  generatedBy: number;

  @Column({ name: 'generated_at', nullable: true })
  generatedAt: Date;

  @Column({ name: 'sent_at', nullable: true })
  sentAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
