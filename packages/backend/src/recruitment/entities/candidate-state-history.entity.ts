import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Candidate } from './candidate.entity';
import { User } from '../../users/user.entity';

@Entity('candidate_state_history')
export class CandidateStateHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación con candidato
  @ManyToOne(() => Candidate, (candidate) => candidate.stateHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;

  @Column({ name: 'candidate_id' })
  candidateId: string;

  // Cambio de estado
  @Column({ name: 'estado_anterior', length: 50 })
  estadoAnterior: string;

  @Column({ name: 'estado_nuevo', length: 50 })
  estadoNuevo: string;

  // Auditoría
  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario?: User;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  fecha: Date;

  @Column('text', { nullable: true })
  comentario?: string;

  // Metadata
  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;
}
