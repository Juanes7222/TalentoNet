import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PayrollPeriod, PayrollPeriodEstado } from '../entities/payroll-period.entity';
import { PayrollEntry } from '../entities/payroll-entry.entity';
import { PayrollNovedad } from '../entities/payroll-novedad.entity';
import { Employee, EmployeeStatus } from '../../employees/employee.entity';
import { PayrollCalculationService } from './payroll-calculation.service';
import {
  CreatePayrollPeriodDto,
  CreateNovedadDto,
  BulkCreateNovedadesDto,
  LiquidatePayrollDto,
  ApprovePayrollDto,
  ClosePayrollDto,
} from '../dto';

/**
 * Servicio principal de nómina
 * Orquesta el flujo completo: períodos, novedades, liquidación, aprobación
 */
@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(
    @InjectRepository(PayrollPeriod)
    private readonly periodRepository: Repository<PayrollPeriod>,
    @InjectRepository(PayrollEntry)
    private readonly entryRepository: Repository<PayrollEntry>,
    @InjectRepository(PayrollNovedad)
    private readonly novedadRepository: Repository<PayrollNovedad>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly calculationService: PayrollCalculationService,
  ) {}

  /**
   * Crea un nuevo período de nómina
   */
  async createPeriod(dto: CreatePayrollPeriodDto, userId: number): Promise<PayrollPeriod> {
    this.logger.log(`Creando período de nómina ${dto.tipo} desde ${dto.fechaInicio} hasta ${dto.fechaFin}`);

    // Validar fechas
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(dto.fechaFin);

    if (fechaFin <= fechaInicio) {
      throw new BadRequestException('La fecha fin debe ser posterior a la fecha inicio');
    }

    // Verificar solapamiento con otros períodos
    const overlap = await this.periodRepository
      .createQueryBuilder('period')
      .where('period.fechaInicio <= :fechaFin', { fechaFin })
      .andWhere('period.fechaFin >= :fechaInicio', { fechaInicio })
      .andWhere('period.estado != :estado', { estado: 'cerrado' })
      .getOne();

    if (overlap) {
      throw new BadRequestException(
        `Ya existe un período abierto que se solapa con estas fechas: ${overlap.descripcion}`,
      );
    }

    const period = this.periodRepository.create({
      tipo: dto.tipo,
      fechaInicio,
      fechaFin,
      descripcion: dto.descripcion,
      estado: 'abierto',
      createdBy: userId,
    });

    return await this.periodRepository.save(period);
  }

  /**
   * Obtiene todos los períodos de nómina
   */
  async findAllPeriods(): Promise<PayrollPeriod[]> {
    return await this.periodRepository.find({
      order: { fechaInicio: 'DESC' },
      relations: ['createdByUser', 'liquidatedByUser', 'approvedByUser'],
    });
  }

  /**
   * Obtiene un período específico
   */
  async findOnePeriod(id: number): Promise<PayrollPeriod> {
    const period = await this.periodRepository.findOne({
      where: { id },
      relations: ['createdByUser', 'liquidatedByUser', 'approvedByUser', 'entries', 'novedades'],
    });

    if (!period) {
      throw new NotFoundException(`Período ${id} no encontrado`);
    }

    return period;
  }

  /**
   * Agrega una novedad a un empleado
   */
  async createNovedad(periodId: number, dto: CreateNovedadDto, userId: number): Promise<PayrollNovedad> {
    const period = await this.findOnePeriod(periodId);

    // Validar que el período esté abierto
    if (period.estado !== 'abierto') {
      throw new BadRequestException(`No se pueden agregar novedades a un período en estado ${period.estado}`);
    }

    // Validar que el empleado exista
    const employee = await this.employeeRepository.findOne({ where: { id: dto.employeeId } });
    if (!employee) {
      throw new NotFoundException(`Empleado ${dto.employeeId} no encontrado`);
    }

    const novedad = this.novedadRepository.create({
      ...dto,
      payrollPeriodId: periodId,
      fecha: new Date(dto.fecha),
      createdBy: userId,
    });

    return await this.novedadRepository.save(novedad);
  }

  /**
   * Carga masiva de novedades (bulk)
   */
  async bulkCreateNovedades(
    periodId: number,
    dto: BulkCreateNovedadesDto,
    userId: number,
  ): Promise<PayrollNovedad[]> {
    this.logger.log(`Cargando ${dto.novedades.length} novedades para período ${periodId}`);

    const period = await this.findOnePeriod(periodId);

    if (period.estado !== 'abierto') {
      throw new BadRequestException(`No se pueden agregar novedades a un período en estado ${period.estado}`);
    }

    const novedades = dto.novedades.map((n) =>
      this.novedadRepository.create({
        ...n,
        payrollPeriodId: periodId,
        fecha: new Date(n.fecha),
        createdBy: userId,
      }),
    );

    return await this.novedadRepository.save(novedades);
  }

  /**
   * Obtiene todas las novedades de un período
   */
  async findNovedadesByPeriod(periodId: number): Promise<PayrollNovedad[]> {
    return await this.novedadRepository.find({
      where: { payrollPeriodId: periodId },
      relations: ['employee', 'createdByUser'],
      order: { fecha: 'DESC' },
    });
  }

  /**
   * Liquida el período (ejecuta cálculo de nómina)
   */
  async liquidatePeriod(periodId: number, dto: LiquidatePayrollDto, userId: number): Promise<PayrollEntry[]> {
    this.logger.log(`Liquidando período ${periodId}`);

    const period = await this.findOnePeriod(periodId);

    // Validar estado
    if (period.estado !== 'abierto') {
      throw new BadRequestException(`Solo se pueden liquidar períodos en estado 'abierto'`);
    }

    // Obtener empleados a liquidar
    let employeeIds: string[];
    if (dto.employeeIds && dto.employeeIds.length > 0) {
      employeeIds = dto.employeeIds;
    } else {
      // Liquidar todos los empleados activos
      const activeEmployees = await this.employeeRepository.find({
        where: { status: EmployeeStatus.ACTIVE },
      });
      employeeIds = activeEmployees.map((e) => e.id);
    }

    this.logger.log(`Liquidando ${employeeIds.length} empleados`);

    // Calcular nómina para cada empleado
    const entries: PayrollEntry[] = [];

    for (const employeeId of employeeIds) {
      try {
        const fechaInicio = new Date(period.fechaInicio as any);
        const fechaFin = new Date(period.fechaFin as any);

        const calculation = await this.calculationService.calculatePayroll(
          employeeId,
          periodId,
          fechaInicio,
          fechaFin,
        );

        let entry = await this.entryRepository.findOne({
          where: { payrollPeriodId: periodId, employeeId },
        });

        if (entry) {
          entry.payrollPeriodId = periodId;
          entry.employeeId = calculation.employeeId;
          entry.salarioBase = calculation.salarioBase as any;
          entry.horasExtras = calculation.horasExtras as any;
          entry.comisiones = calculation.comisiones as any;
          entry.bonificaciones = calculation.bonificaciones as any;
          entry.otrosDevengos = calculation.otrosDevengos as any;
          entry.totalDevengado = calculation.totalDevengado as any;
          entry.salud = calculation.salud as any;
          entry.pension = calculation.pension as any;
          entry.fondoSolidaridad = calculation.fondoSolidaridad as any;
          entry.retencionFuente = calculation.retencionFuente as any;
          entry.otrasDeducciones = calculation.otrasDeducciones as any;
          entry.totalDeducido = calculation.totalDeducido as any;
          entry.neto = calculation.neto as any;
          entry.detallesJson = calculation.detallesJson;
          entry.calculatedBy = userId;
          entry.calculatedAt = new Date();
        } else {
          entry = this.entryRepository.create({
            ...calculation,
            payrollPeriodId: periodId,
            calculatedBy: userId,
            calculatedAt: new Date(),
          });
        }

        entries.push(await this.entryRepository.save(entry));
      } catch (error) {
        this.logger.error(`Error liquidando empleado ${employeeId}: ${error.message}`);
        throw error;
      }
    }

    // Actualizar estado del período
    period.estado = 'liquidado';
    period.liquidatedBy = userId;
    period.liquidatedAt = new Date();
    await this.periodRepository.save(period);

    this.logger.log(`Período ${periodId} liquidado exitosamente`);

    return entries;
  }

  /**
   * Aprueba el período (Gerencia)
   */
  async approvePeriod(periodId: number, dto: ApprovePayrollDto, userId: number): Promise<PayrollPeriod> {
    this.logger.log(`Aprobando período ${periodId}`);

    const period = await this.findOnePeriod(periodId);

    if (period.estado !== 'liquidado') {
      throw new BadRequestException(`Solo se pueden aprobar períodos en estado 'liquidado'`);
    }

    period.estado = 'aprobado';
    period.approvedBy = userId;
    period.approvedAt = new Date();

    return await this.periodRepository.save(period);
  }

  /**
   * Cierra el período (Contabilidad)
   */
  async closePeriod(periodId: number, dto: ClosePayrollDto, userId: number): Promise<PayrollPeriod> {
    this.logger.log(`Cerrando período ${periodId}`);

    const period = await this.findOnePeriod(periodId);

    if (period.estado !== 'aprobado') {
      throw new BadRequestException(`Solo se pueden cerrar períodos en estado 'aprobado'`);
    }

    period.estado = 'cerrado';

    return await this.periodRepository.save(period);
  }

  /**
   * Obtiene todas las liquidaciones de un período
   */
  async findEntriesByPeriod(periodId: number): Promise<PayrollEntry[]> {
    return await this.entryRepository.find({
      where: { payrollPeriodId: periodId },
      relations: ['employee', 'calculatedByUser'],
      order: { neto: 'DESC' },
    });
  }

  /**
   * Obtiene la liquidación de un empleado específico en un período
   */
  async findEntryByEmployeeAndPeriod(periodId: number, employeeId: string): Promise<PayrollEntry> {
    const entry = await this.entryRepository.findOne({
      where: { payrollPeriodId: periodId, employeeId },
      relations: ['employee', 'period', 'calculatedByUser'],
    });

    if (!entry) {
      throw new NotFoundException(`No se encontró liquidación para empleado ${employeeId} en período ${periodId}`);
    }

    return entry;
  }
}
