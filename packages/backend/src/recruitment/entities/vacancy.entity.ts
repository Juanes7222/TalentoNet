import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Candidate } from './candidate.entity';

export enum VacancyStatus {
  ABIERTA = 'abierta',
  EN_PROCESO = 'en_proceso',
  CERRADA = 'cerrada',
  CANCELADA = 'cancelada',
}

@Entity('vacancies')
export class Vacancy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  departamento: string;

  @Column({ length: 150 })
  cargo: string;

  @Column('text')
  descripcion: string;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @Column({ name: 'experiencia_requerida', length: 255, nullable: true })
  experienciaRequerida?: string;

  @Column({ name: 'nivel_educacion', length: 100, nullable: true })
  nivelEducacion?: string;

  @Column({ name: 'habilidades_requeridas', type: 'text', array: true, nullable: true })
  habilidadesRequeridas?: string[];

  @Column({ name: 'salario_min', type: 'decimal', precision: 12, scale: 2, nullable: true })
  salarioMin?: number;

  @Column({ name: 'salario_max', type: 'decimal', precision: 12, scale: 2, nullable: true })
  salarioMax?: number;

  @Column({ name: 'fecha_solicitud', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fechaSolicitud: Date;

  @Column({ name: 'fecha_cierre', type: 'timestamptz', nullable: true })
  fechaCierre?: Date;

  @Column({
    type: 'varchar',
    length: 50,
    default: VacancyStatus.ABIERTA,
  })
  estado: VacancyStatus;

  // Relaciones
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'creador_id' })
  creador: User;

  @Column({ name: 'creador_id' })
  creadorId: string;

  @OneToMany(() => Candidate, (candidate) => candidate.vacancy)
  candidates: Candidate[];

  // Timestamps
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
