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

/**
 * Entidad para parámetros configurables de nómina
 * Permite ajustar porcentajes, valores base y reglas sin cambiar código
 */
@Entity('payroll_config')
export class PayrollConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  key: string;

  @Column({ type: 'jsonb' })
  value: any;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedByUser: User;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
