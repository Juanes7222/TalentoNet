import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, EmployeeStatus } from '../../employees/employee.entity';
import { Contract } from '../contract.entity';
import { PayrollNovedad } from '../entities/payroll-novedad.entity';
import { PayrollConfigService } from './payroll-config.service';

export interface PayrollCalculationResult {
  employeeId: string;
  salarioBase: number;
  horasExtras: number;
  comisiones: number;
  bonificaciones: number;
  otrosDevengos: number;
  totalDevengado: number;
  salud: number;
  pension: number;
  fondoSolidaridad: number;
  retencionFuente: number;
  otrasDeducciones: number;
  totalDeducido: number;
  neto: number;
  detallesJson: any;
}

/**
 * Motor de cálculo de nómina
 * Procesa devengos, deducciones y aplica reglas configurables
 */
@Injectable()
export class PayrollCalculationService {
  private readonly logger = new Logger(PayrollCalculationService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(PayrollNovedad)
    private readonly novedadRepository: Repository<PayrollNovedad>,
    private readonly configService: PayrollConfigService,
  ) {}

  /**
   * Calcula la liquidación de un empleado para un período
   */
  async calculatePayroll(
    employeeId: string,
    periodId: number,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<PayrollCalculationResult> {
    this.logger.log(`Calculando nómina para empleado ${employeeId}, período ${periodId}`);

    // Obtener empleado
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new BadRequestException(`Empleado ${employeeId} no encontrado`);
    }

    if (employee.status !== EmployeeStatus.ACTIVE) {
      throw new BadRequestException(`Empleado ${employeeId} no está activo`);
    }

    // Obtener contrato actual
    const contract = await this.contractRepository.findOne({
      where: { employeeId, isCurrent: true },
      order: { startDate: 'DESC' },
    });

    if (!contract) {
      throw new BadRequestException(`No se encontró contrato activo para empleado ${employeeId}`);
    }

    // Obtener novedades del período
    const novedades = await this.novedadRepository.find({
      where: {
        employeeId,
        payrollPeriodId: periodId,
      },
    });

    // Obtener configuración
    const salarioMinimo = await this.configService.getSalarioMinimo();
    const porcentajeSalud = await this.configService.getPorcentajeSalud();
    const porcentajePension = await this.configService.getPorcentajePension();

    // Calcular días del período
    const diasPeriodo = this.calculateDays(fechaInicio, fechaFin);
    const diasMes = 30; // Asumimos mes de 30 días para cálculo proporcional

    // ========== CALCULAR SALARIO BASE ==========
    const salarioMensual = Number(contract.salary) || salarioMinimo;
    const salarioBase = this.calculateProportionalSalary(salarioMensual, diasPeriodo, diasMes);

    // ========== CALCULAR DEVENGOS ADICIONALES ==========
    const devengos = this.calculateDevengos(novedades, employee);

    // ========== CALCULAR TOTAL DEVENGADO ==========
    const totalDevengado =
      salarioBase +
      devengos.horasExtras +
      devengos.comisiones +
      devengos.bonificaciones +
      devengos.otrosDevengos;

    // Validar salario mínimo
    const salarioMinimoProporcional = this.calculateProportionalSalary(salarioMinimo, diasPeriodo, diasMes);
    if (totalDevengado < salarioMinimoProporcional) {
      this.logger.warn(
        `Salario total ${totalDevengado} es menor al mínimo proporcional ${salarioMinimoProporcional}`,
      );
    }

    // ========== CALCULAR DEDUCCIONES ==========
    const deducciones = await this.calculateDeducciones(
      totalDevengado,
      salarioMensual,
      novedades,
      porcentajeSalud,
      porcentajePension,
    );

    // ========== CALCULAR NETO ==========
    const neto = totalDevengado - deducciones.totalDeducido;

    // ========== GENERAR DETALLES JSON ==========
    const detallesJson = {
      empleado: {
        id: employee.id,
        nombre: employee.firstName + ' ' + employee.lastName,
        identificacion: employee.identificationNumber,
        cargo: contract.position,
        departamento: contract.department,
        salarioMensual,
      },
      periodo: {
        fechaInicio,
        fechaFin,
        dias: diasPeriodo,
      },
      devengos: {
        salarioBase,
        horasExtras: devengos.horasExtras,
        comisiones: devengos.comisiones,
        bonificaciones: devengos.bonificaciones,
        otrosDevengos: devengos.otrosDevengos,
        total: totalDevengado,
        detalleNovedades: devengos.detalle,
      },
      deducciones: {
        salud: deducciones.salud,
        pension: deducciones.pension,
        fondoSolidaridad: deducciones.fondoSolidaridad,
        retencionFuente: deducciones.retencionFuente,
        otrasDeducciones: deducciones.otrasDeducciones,
        total: deducciones.totalDeducido,
        detalleNovedades: deducciones.detalle,
      },
      neto,
      configuracion: {
        porcentajeSalud,
        porcentajePension,
        salarioMinimo,
      },
    };

    return {
      employeeId,
      salarioBase: this.round(salarioBase),
      horasExtras: this.round(devengos.horasExtras),
      comisiones: this.round(devengos.comisiones),
      bonificaciones: this.round(devengos.bonificaciones),
      otrosDevengos: this.round(devengos.otrosDevengos),
      totalDevengado: this.round(totalDevengado),
      salud: this.round(deducciones.salud),
      pension: this.round(deducciones.pension),
      fondoSolidaridad: this.round(deducciones.fondoSolidaridad),
      retencionFuente: this.round(deducciones.retencionFuente),
      otrasDeducciones: this.round(deducciones.otrasDeducciones),
      totalDeducido: this.round(deducciones.totalDeducido),
      neto: this.round(neto),
      detallesJson,
    };
  }

  /**
   * Calcula devengos adicionales (horas extras, comisiones, bonos)
   */
  private calculateDevengos(novedades: PayrollNovedad[], employee: Employee) {
    const devengosNovedades = novedades.filter((n) => n.categoria === 'devengo');

    let horasExtras = 0;
    let comisiones = 0;
    let bonificaciones = 0;
    let otrosDevengos = 0;
    const detalle: any[] = [];

    for (const novedad of devengosNovedades) {
      const valorTotal = novedad.valor * (novedad.cantidad || 1);

      if (novedad.tipo.includes('horas_extras') || novedad.tipo.includes('horas_dominicales')) {
        horasExtras += valorTotal;
      } else if (novedad.tipo.includes('comision')) {
        comisiones += valorTotal;
      } else if (novedad.tipo.includes('bono') || novedad.tipo.includes('bonificacion')) {
        bonificaciones += valorTotal;
      } else {
        otrosDevengos += valorTotal;
      }

      detalle.push({
        tipo: novedad.tipo,
        cantidad: novedad.cantidad,
        valorUnitario: novedad.valor,
        valorTotal,
        comentario: novedad.comentario,
      });
    }

    return {
      horasExtras,
      comisiones,
      bonificaciones,
      otrosDevengos,
      detalle,
    };
  }

  /**
   * Calcula deducciones (salud, pensión, fondo solidaridad, retención, otras)
   */
  private async calculateDeducciones(
    totalDevengado: number,
    salarioMensual: number,
    novedades: PayrollNovedad[],
    porcentajeSalud: number,
    porcentajePension: number,
  ) {
    const baseCotizacion = salarioMensual;

    const salud = (baseCotizacion * porcentajeSalud) / 100;
    const pension = (baseCotizacion * porcentajePension) / 100;

    const salarioMinimo = await this.configService.getSalarioMinimo();
    const porcentajeFondo = await this.configService.getPorcentajeFondoSolidaridad();
    let fondoSolidaridad = 0;
    if (salarioMensual >= salarioMinimo * 4) {
      fondoSolidaridad = (baseCotizacion * porcentajeFondo) / 100;
    }

    let retencionFuente = 0;
    const baseRetencion = await this.configService.getBaseRetencionFuente();
    const baseUvt = baseRetencion.uvt * baseRetencion.uvtValue;
    if (salarioMensual > baseUvt) {
      retencionFuente = ((salarioMensual - baseUvt) * 10) / 100;
    }

    const deduccionesNovedades = novedades.filter((n) => n.categoria === 'deduccion');
    let otrasDeducciones = 0;
    const detalle: any[] = [];

    for (const novedad of deduccionesNovedades) {
      const valorTotal = novedad.valor * (novedad.cantidad || 1);
      otrasDeducciones += valorTotal;

      detalle.push({
        tipo: novedad.tipo,
        cantidad: novedad.cantidad,
        valorUnitario: novedad.valor,
        valorTotal,
        comentario: novedad.comentario,
      });
    }

    const totalDeducido = salud + pension + fondoSolidaridad + retencionFuente + otrasDeducciones;

    return {
      salud,
      pension,
      fondoSolidaridad,
      retencionFuente,
      otrasDeducciones,
      totalDeducido,
      detalle,
    };
  }

  /**
   * Calcula salario proporcional según días
   */
  private calculateProportionalSalary(salarioMensual: number, diasTrabajados: number, diasMes: number): number {
    return (salarioMensual / diasMes) * diasTrabajados;
  }

  /**
   * Calcula días entre dos fechas
   */
  private calculateDays(fechaInicio: Date | string, fechaFin: Date | string): number {
    const start = fechaInicio instanceof Date ? fechaInicio : new Date(fechaInicio as any);
    const end = fechaFin instanceof Date ? fechaFin : new Date(fechaFin as any);

    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
