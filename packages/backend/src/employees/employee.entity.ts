import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Contract } from '../payroll/contract.entity';
import { Affiliation } from '../payroll/affiliation.entity';
import { PayrollEntry } from '../payroll/payroll-entry.entity';
import { Document } from '../documents/document.entity';

export enum IdentificationType {
  CC = 'CC',
  CE = 'CE',
  TI = 'TI',
  PAS = 'PAS',
}

export enum Gender {
  M = 'M',
  F = 'F',
  OTHER = 'Otro',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'identification_type',
  })
  identificationType: IdentificationType;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    name: 'identification_number',
  })
  identificationNumber: string;

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName: string;

  @Column({ type: 'date', name: 'date_of_birth' })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: Gender;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 100, default: 'Colombia' })
  country: string;

  @Column({ type: 'date', name: 'hire_date' })
  hireDate: Date;

  @Column({ type: 'date', nullable: true, name: 'termination_date' })
  terminationDate: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @OneToMany(() => Contract, (contract) => contract.employee)
  contracts: Contract[];

  @OneToMany(() => Affiliation, (affiliation) => affiliation.employee)
  affiliations: Affiliation[];

  @OneToMany(() => PayrollEntry, (payroll) => payroll.employee)
  payrollEntries: PayrollEntry[];

  @OneToMany(() => Document, (document) => document.employee)
  documents: Document[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual fields
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
