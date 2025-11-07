import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Employee } from '../../employees/employee.entity';
import { Contract } from '../../payroll/contract.entity';
import { ContractSettlementAudit } from './contract-settlement-audit.entity';

export type SettlementEstado =
  | 'borrador'
  | 'pendiente_aprobacion'
  | 'aprobado'
  | 'pagado'
  | 'rechazado';

export type TipoIndemnizacion = 'sin_justa_causa' | 'terminacion_anticipada' | null;

/**
 * Entidad para liquidaciones definitivas de contratos
 * Calcula prestaciones sociales según normativa colombiana
 */
@Entity('contract_settlements')
export class ContractSettlement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relaciones principales
  @ManyToOne(() => Contract, { nullable: false })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Column({ name: 'contract_id', type: 'uuid' })
  contractId: string;

  @ManyToOne(() => Employee, { nullable: false })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  // Datos base
  @Column({ name: 'fecha_liquidacion', type: 'date' })
  fechaLiquidacion: Date;

  @Column({ name: 'fecha_inicio_contrato', type: 'date' })
  fechaInicioContrato: Date;

  @Column({ name: 'fecha_fin_contrato', type: 'date' })
  fechaFinContrato: Date;

  @Column({ name: 'dias_trabajados', type: 'int' })
  diasTrabajados: number;

  @Column({ name: 'ultimo_salario', type: 'decimal', precision: 15, scale: 2 })
  ultimoSalario: number;

  @Column({ name: 'promedio_salario', type: 'decimal', precision: 15, scale: 2, nullable: true })
  promedioSalario: number;

  // Prestaciones sociales
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  cesantias: number;

  @Column({ name: 'intereses_cesantias', type: 'decimal', precision: 15, scale: 2, default: 0 })
  interesesCesantias: number;

  @Column({ name: 'prima_servicios', type: 'decimal', precision: 15, scale: 2, default: 0 })
  primaServicios: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  vacaciones: number;

  // Indemnizaciones
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  indemnizacion: number;

  @Column({ name: 'tipo_indemnizacion', type: 'varchar', length: 50, nullable: true })
  tipoIndemnizacion: TipoIndemnizacion;

  // Otros conceptos
  @Column({ name: 'otros_conceptos', type: 'decimal', precision: 15, scale: 2, default: 0 })
  otrosConceptos: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  deducciones: number;

  // Total
  @Column({ name: 'total_liquidacion', type: 'decimal', precision: 15, scale: 2 })
  totalLiquidacion: number;

  // Detalles JSON
  @Column({ name: 'detalle_json', type: 'jsonb', nullable: true })
  detalleJson: any;

  // Estado
  @Column({ type: 'varchar', length: 20, default: 'borrador' })
  estado: SettlementEstado;

  // PDF
  @Column({ name: 'pdf_s3_key', type: 'varchar', length: 500, nullable: true })
  pdfS3Key: string;

  @Column({ name: 'pdf_url', type: 'text', nullable: true })
  pdfUrl: string;

  @Column({ name: 'pdf_generado_at', type: 'timestamp', nullable: true })
  pdfGeneradoAt: Date;

  // Aprobación
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'aprobado_por' })
  aprobadoPorUser: User;

  @Column({ name: 'aprobado_por', type: 'uuid', nullable: true })
  aprobadoPor: string;

  @Column({ name: 'aprobado_at', type: 'timestamp', nullable: true })
  aprobadoAt: Date;

  @Column({ name: 'comentarios_aprobacion', type: 'text', nullable: true })
  comentariosAprobacion: string;

  // Rechazo
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'rechazado_por' })
  rechazadoPorUser: User;

  @Column({ name: 'rechazado_por', type: 'uuid', nullable: true })
  rechazadoPor: string;

  @Column({ name: 'rechazado_at', type: 'timestamp', nullable: true })
  rechazadoAt: Date;

  @Column({ name: 'motivo_rechazo', type: 'text', nullable: true })
  motivoRechazo: string;

  // Pago
  @Column({ name: 'pagado_at', type: 'timestamp', nullable: true })
  pagadoAt: Date;

  @Column({ name: 'referencia_pago', type: 'varchar', length: 100, nullable: true })
  referenciaPago: string;

  // Auditoría
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedByUser: User;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  // Relación inversa con auditoría
  @OneToMany(() => ContractSettlementAudit, (audit) => audit.settlement)
  auditLogs: ContractSettlementAudit[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
