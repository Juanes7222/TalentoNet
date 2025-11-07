import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractSettlement } from '../entities/contract-settlement.entity';
import { ContractSettlementAudit } from '../entities/contract-settlement-audit.entity';
import { Contract } from '../../payroll/contract.entity';
import { Employee } from '../../employees/employee.entity';
import {
  ContractSettlementCalculationService,
  SettlementCalculationResult,
} from './contract-settlement-calculation.service';
import {
  CreateSettlementDto,
  UpdateSettlementDto,
  ApproveSettlementDto,
  RejectSettlementDto,
  MarkAsPaidDto,
} from '../dto/settlement.dto';

/**
 * Servicio principal para gestión de liquidaciones de contratos
 */
@Injectable()
export class ContractSettlementService {
  private readonly logger = new Logger(ContractSettlementService.name);

  constructor(
    @InjectRepository(ContractSettlement)
    private readonly settlementRepository: Repository<ContractSettlement>,
    @InjectRepository(ContractSettlementAudit)
    private readonly auditRepository: Repository<ContractSettlementAudit>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly calculationService: ContractSettlementCalculationService,
  ) {}

  /**
   * Genera una nueva liquidación para un contrato
   */
  async generateSettlement(
    contractId: string,
    dto: CreateSettlementDto,
    userId: string,
  ): Promise<ContractSettlement> {
    this.logger.log(`Generando liquidación para contrato ${contractId}`);

    // Verificar que el contrato exista
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
      relations: ['employee'],
    });

    if (!contract) {
      throw new NotFoundException(`Contrato ${contractId} no encontrado`);
    }

    // Verificar que no exista ya una liquidación para este contrato
    const existing = await this.settlementRepository.findOne({
      where: { contractId },
    });

    if (existing) {
      throw new BadRequestException(`Ya existe una liquidación para el contrato ${contractId}`);
    }

    // Fecha de liquidación
    const fechaLiquidacion = dto.fechaLiquidacion ? new Date(dto.fechaLiquidacion) : new Date();

    // Calcular la liquidación
    const calculation = await this.calculationService.calculateSettlement(
      contract,
      fechaLiquidacion,
      dto.tipoIndemnizacion,
    );

    // Crear la entidad
    const settlement = this.settlementRepository.create({
      contractId,
      employeeId: contract.employeeId,
      fechaLiquidacion,
      fechaInicioContrato: contract.startDate,
      fechaFinContrato: fechaLiquidacion,
      diasTrabajados: calculation.diasTrabajados,
      ultimoSalario: calculation.ultimoSalario as any,
      promedioSalario: calculation.promedioSalario as any,
      cesantias: calculation.cesantias as any,
      interesesCesantias: calculation.interesesCesantias as any,
      primaServicios: calculation.primaServicios as any,
      vacaciones: calculation.vacaciones as any,
      indemnizacion: calculation.indemnizacion as any,
      tipoIndemnizacion: dto.tipoIndemnizacion,
      otrosConceptos: 0 as any,
      deducciones: 0 as any,
      totalLiquidacion: calculation.total as any,
      detalleJson: {
        calculoAutomatico: calculation.detalle,
        advertencias: calculation.advertencias,
        ajustesManuales: [],
      },
      estado: 'borrador',
      notas: dto.notas,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.settlementRepository.save(settlement);

    this.logger.log(`Liquidación ${saved.id} creada exitosamente`);

    return saved;
  }

  /**
   * Actualiza valores de una liquidación (ajustes manuales)
   */
  async updateSettlement(
    settlementId: string,
    dto: UpdateSettlementDto,
    userId: string,
  ): Promise<ContractSettlement> {
    this.logger.log(`Actualizando liquidación ${settlementId}`);

    const settlement = await this.findOne(settlementId);

    // Solo se pueden editar liquidaciones en borrador o pendiente de aprobación
    if (!['borrador', 'pendiente_aprobacion'].includes(settlement.estado)) {
      throw new BadRequestException(
        `No se puede editar una liquidación en estado ${settlement.estado}`,
      );
    }

    // Guardar valores anteriores para auditoría
    const cambios: Array<{ campo: string; anterior: any; nuevo: any }> = [];

    // Aplicar cambios y registrar auditoría
    if (dto.cesantias !== undefined && dto.cesantias !== settlement.cesantias) {
      cambios.push({
        campo: 'cesantias',
        anterior: settlement.cesantias,
        nuevo: dto.cesantias,
      });
      settlement.cesantias = dto.cesantias;
    }

    if (dto.interesesCesantias !== undefined && dto.interesesCesantias !== settlement.interesesCesantias) {
      cambios.push({
        campo: 'interesesCesantias',
        anterior: settlement.interesesCesantias,
        nuevo: dto.interesesCesantias,
      });
      settlement.interesesCesantias = dto.interesesCesantias;
    }

    if (dto.primaServicios !== undefined && dto.primaServicios !== settlement.primaServicios) {
      cambios.push({
        campo: 'primaServicios',
        anterior: settlement.primaServicios,
        nuevo: dto.primaServicios,
      });
      settlement.primaServicios = dto.primaServicios;
    }

    if (dto.vacaciones !== undefined && dto.vacaciones !== settlement.vacaciones) {
      cambios.push({
        campo: 'vacaciones',
        anterior: settlement.vacaciones,
        nuevo: dto.vacaciones,
      });
      settlement.vacaciones = dto.vacaciones;
    }

    if (dto.indemnizacion !== undefined && dto.indemnizacion !== settlement.indemnizacion) {
      cambios.push({
        campo: 'indemnizacion',
        anterior: settlement.indemnizacion,
        nuevo: dto.indemnizacion,
      });
      settlement.indemnizacion = dto.indemnizacion;
    }

    if (dto.otrosConceptos !== undefined && dto.otrosConceptos !== settlement.otrosConceptos) {
      cambios.push({
        campo: 'otrosConceptos',
        anterior: settlement.otrosConceptos,
        nuevo: dto.otrosConceptos,
      });
      settlement.otrosConceptos = dto.otrosConceptos;
    }

    if (dto.deducciones !== undefined && dto.deducciones !== settlement.deducciones) {
      cambios.push({
        campo: 'deducciones',
        anterior: settlement.deducciones,
        nuevo: dto.deducciones,
      });
      settlement.deducciones = dto.deducciones;
    }

    if (dto.notas !== undefined) {
      settlement.notas = dto.notas;
    }

    // Recalcular total
    settlement.totalLiquidacion =
      Number(settlement.cesantias) +
      Number(settlement.interesesCesantias) +
      Number(settlement.primaServicios) +
      Number(settlement.vacaciones) +
      Number(settlement.indemnizacion) +
      Number(settlement.otrosConceptos) -
      Number(settlement.deducciones);

    settlement.updatedBy = userId;

    // Guardar cambios en detalleJson
    const ajustesManuales = settlement.detalleJson?.ajustesManuales || [];
    if (cambios.length > 0) {
      ajustesManuales.push({
        fecha: new Date(),
        usuario: userId,
        cambios,
        justificacion: dto.justificacion,
      });
      settlement.detalleJson = {
        ...settlement.detalleJson,
        ajustesManuales,
      };
    }

    const updated = await this.settlementRepository.save(settlement);

    // Registrar auditoría para cada cambio
    for (const cambio of cambios) {
      await this.auditRepository.save({
        settlementId,
        campoModificado: cambio.campo,
        valorAnterior: String(cambio.anterior),
        valorNuevo: String(cambio.nuevo),
        justificacion: dto.justificacion,
        modificadoPor: userId,
      });
    }

    this.logger.log(`Liquidación ${settlementId} actualizada con ${cambios.length} cambios`);

    return updated;
  }

  /**
   * Aprueba una liquidación (Contadora)
   */
  async approveSettlement(
    settlementId: string,
    dto: ApproveSettlementDto,
    userId: string,
  ): Promise<ContractSettlement> {
    this.logger.log(`Aprobando liquidación ${settlementId}`);

    const settlement = await this.findOne(settlementId);

    if (settlement.estado === 'aprobado') {
      throw new BadRequestException('La liquidación ya está aprobada');
    }

    if (settlement.estado === 'pagado') {
      throw new BadRequestException('La liquidación ya está pagada');
    }

    settlement.estado = 'aprobado';
    settlement.aprobadoPor = userId;
    settlement.aprobadoAt = new Date();
    if (dto.comentarios) {
      settlement.comentariosAprobacion = dto.comentarios;
    }
    settlement.updatedBy = userId;

    const approved = await this.settlementRepository.save(settlement);

    this.logger.log(`Liquidación ${settlementId} aprobada por usuario ${userId}`);

    // TODO: Notificar al módulo de nómina/contabilidad para programar pago
    // await this.notificationService.notifyPaymentPending(approved);

    return approved;
  }

  /**
   * Rechaza una liquidación
   */
  async rejectSettlement(
    settlementId: string,
    dto: RejectSettlementDto,
    userId: string,
  ): Promise<ContractSettlement> {
    this.logger.log(`Rechazando liquidación ${settlementId}`);

    const settlement = await this.findOne(settlementId);

    if (settlement.estado === 'aprobado') {
      throw new BadRequestException('No se puede rechazar una liquidación ya aprobada');
    }

    if (settlement.estado === 'pagado') {
      throw new BadRequestException('No se puede rechazar una liquidación ya pagada');
    }

    settlement.estado = 'rechazado';
    settlement.rechazadoPor = userId;
    settlement.rechazadoAt = new Date();
    settlement.motivoRechazo = dto.motivo;
    settlement.updatedBy = userId;

    return await this.settlementRepository.save(settlement);
  }

  /**
   * Marca una liquidación como pagada
   */
  async markAsPaid(
    settlementId: string,
    dto: MarkAsPaidDto,
    userId: string,
  ): Promise<ContractSettlement> {
    this.logger.log(`Marcando liquidación ${settlementId} como pagada`);

    const settlement = await this.findOne(settlementId);

    if (settlement.estado !== 'aprobado') {
      throw new BadRequestException('Solo se pueden marcar como pagadas las liquidaciones aprobadas');
    }

    settlement.estado = 'pagado';
    settlement.pagadoAt = dto.fechaPago ? new Date(dto.fechaPago) : new Date();
    settlement.referenciaPago = dto.referenciaPago;
    settlement.updatedBy = userId;

    return await this.settlementRepository.save(settlement);
  }

  /**
   * Obtiene todas las liquidaciones
   */
  async findAll(): Promise<ContractSettlement[]> {
    return await this.settlementRepository.find({
      relations: ['employee', 'contract', 'createdByUser', 'aprobadoPorUser'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene una liquidación por ID
   */
  async findOne(id: string): Promise<ContractSettlement> {
    const settlement = await this.settlementRepository.findOne({
      where: { id },
      relations: [
        'employee',
        'contract',
        'createdByUser',
        'updatedByUser',
        'aprobadoPorUser',
        'rechazadoPorUser',
        'auditLogs',
      ],
    });

    if (!settlement) {
      throw new NotFoundException(`Liquidación ${id} no encontrada`);
    }

    return settlement;
  }

  /**
   * Obtiene liquidaciones por empleado
   */
  async findByEmployee(employeeId: string): Promise<ContractSettlement[]> {
    return await this.settlementRepository.find({
      where: { employeeId },
      relations: ['contract', 'createdByUser', 'aprobadoPorUser'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene liquidación por contrato
   */
  async findByContract(contractId: string): Promise<ContractSettlement | null> {
    return await this.settlementRepository.findOne({
      where: { contractId },
      relations: ['employee', 'contract', 'createdByUser', 'aprobadoPorUser', 'auditLogs'],
    });
  }
}
