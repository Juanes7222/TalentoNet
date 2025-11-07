import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { ContractSettlement } from './contract-settlement.entity';

/**
 * Entidad para auditoría de cambios en liquidaciones
 * Registra modificaciones manuales con justificación
 */
@Entity('contract_settlement_audit')
export class ContractSettlementAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ContractSettlement, (settlement) => settlement.auditLogs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'settlement_id' })
  settlement: ContractSettlement;

  @Column({ name: 'settlement_id', type: 'uuid' })
  settlementId: string;

  @Column({ name: 'campo_modificado', type: 'varchar', length: 100 })
  campoModificado: string;

  @Column({ name: 'valor_anterior', type: 'text', nullable: true })
  valorAnterior: string;

  @Column({ name: 'valor_nuevo', type: 'text', nullable: true })
  valorNuevo: string;

  @Column({ type: 'text', nullable: true })
  justificacion: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'modificado_por' })
  modificadoPorUser: User;

  @Column({ name: 'modificado_por', type: 'uuid', nullable: true })
  modificadoPor: string;

  @CreateDateColumn({ name: 'modificado_at' })
  modificadoAt: Date;
}
