import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';
import { Employee } from '../employees/employee.entity';

export enum UserStatus {
  INVITED = 'INVITED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserStatus.INVITED,
  })
  status: UserStatus;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id', nullable: true })
  employeeId: string;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @Column({ name: 'mfa_enabled', default: false })
  mfaEnabled: boolean;

  @Column({ name: 'mfa_secret_encrypted', nullable: true, type: 'text' })
  mfaSecretEncrypted: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by', nullable: true })
  createdById: string;

  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
