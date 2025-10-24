import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Candidate } from './candidate.entity';
import { User } from '../../users/user.entity';

export enum InterviewType {
  TELEFONICA = 'telefonica',
  PRESENCIAL = 'presencial',
  VIRTUAL = 'virtual',
  TECNICA = 'tecnica',
  PSICOTECNICA = 'psicotecnica',
}

export enum InterviewResult {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
  REAGENDAR = 'reagendar',
}

export enum InterviewStatus {
  PROGRAMADA = 'programada',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  REPROGRAMADA = 'reprogramada',
}

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación con candidato
  @ManyToOne(() => Candidate, (candidate) => candidate.interviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;

  @Column({ name: 'candidate_id' })
  candidateId: string;

  // Programación
  @Column({ type: 'timestamptz' })
  fecha: Date;

  @Column({ name: 'duracion_minutos', type: 'int', default: 60 })
  duracionMinutos: number;

  // Entrevistador
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'entrevistador_id' })
  entrevistador: User;

  @Column({ name: 'entrevistador_id' })
  entrevistadorId: string;

  // Tipo de entrevista
  @Column({
    type: 'varchar',
    length: 50,
  })
  tipo: InterviewType;

  // Resultado
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  resultado?: InterviewResult;

  @Column({ type: 'int', nullable: true })
  puntuacion?: number;

  // Notas
  @Column('text', { nullable: true })
  notas?: string;

  @Column({ type: 'text', array: true, nullable: true })
  fortalezas?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  debilidades?: string[];

  // Estado
  @Column({
    type: 'varchar',
    length: 50,
    default: InterviewStatus.PROGRAMADA,
  })
  estado: InterviewStatus;

  // Timestamps
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
