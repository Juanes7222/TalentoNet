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
import { Vacancy } from './vacancy.entity';
import { Interview } from './interview.entity';
import { CandidateStateHistory } from './candidate-state-history.entity';

export enum CandidateStatus {
  POSTULADO = 'postulado',
  PRESELECCIONADO = 'preseleccionado',
  ENTREVISTADO = 'entrevistado',
  PRUEBAS_TECNICAS = 'pruebas_tecnicas',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
  CONTRATADO = 'contratado',
}

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación con vacante
  @ManyToOne(() => Vacancy, (vacancy) => vacancy.candidates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vacancy_id' })
  vacancy: Vacancy;

  @Column({ name: 'vacancy_id' })
  vacancyId: string;

  // Información personal
  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 100 })
  apellido: string;

  @Column({ length: 20 })
  cedula: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 20 })
  telefono: string;

  @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
  fechaNacimiento?: Date;

  // Información laboral
  @Column({ name: 'experiencia_anios', type: 'int', nullable: true })
  experienciaAnios?: number;

  @Column({ name: 'ultimo_cargo', length: 150, nullable: true })
  ultimoCargo?: string;

  @Column({ name: 'ultima_empresa', length: 200, nullable: true })
  ultimaEmpresa?: string;

  @Column({ name: 'nivel_educacion', length: 100, nullable: true })
  nivelEducacion?: string;

  // Expectativas
  @Column({ name: 'expectativa_salarial', type: 'decimal', precision: 12, scale: 2, nullable: true })
  expectativaSalarial?: number;

  @Column({ length: 50, nullable: true })
  disponibilidad?: string;

  // Proceso
  @Column({ name: 'fecha_postulacion', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fechaPostulacion: Date;

  @Column({
    name: 'estado_proceso',
    type: 'varchar',
    length: 50,
    default: CandidateStatus.POSTULADO,
  })
  estadoProceso: CandidateStatus;

  // Notas y evaluación
  @Column('text', { nullable: true })
  notas?: string;

  @Column({ type: 'int', nullable: true })
  puntuacion?: number;

  // Relaciones
  @OneToMany(() => Interview, (interview) => interview.candidate)
  interviews: Interview[];

  @OneToMany(() => CandidateStateHistory, (history) => history.candidate)
  stateHistory: CandidateStateHistory[];

  // Timestamps
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Computed properties
  get fullName(): string {
    return `${this.nombre} ${this.apellido}`;
  }
}
