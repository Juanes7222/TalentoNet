import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Contract } from '../../payroll/contract.entity';
import { PayrollEntry } from '../../payroll/entities/payroll-entry.entity';

/**
 * Resultado del cálculo de liquidación
 */
export interface SettlementCalculationResult {
  // Datos base
  diasTrabajados: number;
  ultimoSalario: number;
  promedioSalario: number | null;
  
  // Prestaciones sociales
  cesantias: number;
  interesesCesantias: number;
  primaServicios: number;
  vacaciones: number;
  
  // Indemnización
  indemnizacion: number;
  
  // Total
  total: number;
  
  // Detalles del cálculo
  detalle: {
    cesantias: any;
    intereses: any;
    prima: any;
    vacaciones: any;
    indemnizacion: any;
  };
  
  // Advertencias
  advertencias: string[];
}

/**
 * Servicio de cálculo de liquidaciones según normativa colombiana
 * 
 * Referencias legales:
 * - Cesantías: Art 249 CST - 1 mes de salario por año
 * - Intereses: Art 99 Ley 50/1990 - 12% anual sobre cesantías
 * - Prima: Art 306 CST - 15 días por semestre
 * - Vacaciones: Art 186 CST - 15 días hábiles por año
 * - Indemnizaciones: Art 64 CST
 */
@Injectable()
export class ContractSettlementCalculationService {
  private readonly logger = new Logger(ContractSettlementCalculationService.name);

  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(PayrollEntry)
    private readonly payrollEntryRepository: Repository<PayrollEntry>,
  ) {}

  /**
   * Calcula la liquidación completa de un contrato
   */
  async calculateSettlement(
    contract: Contract,
    fechaLiquidacion: Date,
    tipoIndemnizacion?: 'sin_justa_causa' | 'terminacion_anticipada',
  ): Promise<SettlementCalculationResult> {
    this.logger.log(`Calculando liquidación para contrato ${contract.id}`);

    const advertencias: string[] = [];
    const fechaInicio = new Date(contract.startDate);
    const fechaFin = fechaLiquidacion;

    // Calcular días trabajados
    const diasTrabajados = this.calculateDays(fechaInicio, fechaFin);

    // Obtener salarios
    const ultimoSalario = Number(contract.salary);
    const promedioSalario = await this.getAverageSalary(contract.id, fechaFin);

    if (!promedioSalario) {
      advertencias.push(
        'No se encontraron registros salariales históricos. Se usa el último salario para todos los cálculos.',
      );
    }

    const salarioBase = promedioSalario || ultimoSalario;

    // Calcular prestaciones sociales
    const cesantias = this.calcularCesantias(salarioBase, diasTrabajados);
    const interesesCesantias = this.calcularInteresesCesantias(cesantias.total, diasTrabajados);
    const primaServicios = this.calcularPrima(salarioBase, diasTrabajados);
    const vacaciones = this.calcularVacaciones(salarioBase, diasTrabajados);

    // Calcular indemnización si aplica
    let indemnizacion = { total: 0, detalle: {} as any };
    if (tipoIndemnizacion) {
      indemnizacion = this.calcularIndemnizacion(
        ultimoSalario,
        diasTrabajados,
        tipoIndemnizacion,
        contract.contractType,
      );
    }

    // Calcular total
    const total =
      cesantias.total +
      interesesCesantias.total +
      primaServicios.total +
      vacaciones.total +
      indemnizacion.total;

    return {
      diasTrabajados,
      ultimoSalario,
      promedioSalario,
      cesantias: cesantias.total,
      interesesCesantias: interesesCesantias.total,
      primaServicios: primaServicios.total,
      vacaciones: vacaciones.total,
      indemnizacion: indemnizacion.total,
      total,
      detalle: {
        cesantias: cesantias.detalle,
        intereses: interesesCesantias.detalle,
        prima: primaServicios.detalle,
        vacaciones: vacaciones.detalle,
        indemnizacion: indemnizacion.detalle,
      },
      advertencias,
    };
  }

  /**
   * Calcula cesantías según Art. 249 CST
   * Formula: (Salario mensual * Días trabajados) / 360
   */
  private calcularCesantias(
    salarioMensual: number,
    diasTrabajados: number,
  ): { total: number; detalle: any } {
    const total = (salarioMensual * diasTrabajados) / 360;

    return {
      total: this.round(total),
      detalle: {
        formula: '(Salario mensual × Días trabajados) ÷ 360',
        salarioMensual,
        diasTrabajados,
        calculo: `(${salarioMensual} × ${diasTrabajados}) ÷ 360 = ${this.round(total)}`,
      },
    };
  }

  /**
   * Calcula intereses sobre cesantías según Art. 99 Ley 50/1990
   * Formula: (Cesantías * Días trabajados * 0.12) / 360
   */
  private calcularInteresesCesantias(
    cesantias: number,
    diasTrabajados: number,
  ): { total: number; detalle: any } {
    const total = (cesantias * diasTrabajados * 0.12) / 360;

    return {
      total: this.round(total),
      detalle: {
        formula: '(Cesantías × Días trabajados × 12%) ÷ 360',
        cesantias,
        diasTrabajados,
        tasa: 0.12,
        calculo: `(${cesantias} × ${diasTrabajados} × 0.12) ÷ 360 = ${this.round(total)}`,
      },
    };
  }

  /**
   * Calcula prima de servicios según Art. 306 CST
   * Formula: (Salario mensual * Días trabajados) / 360
   * Nota: La prima es de 15 días por semestre (30 días por año)
   */
  private calcularPrima(
    salarioMensual: number,
    diasTrabajados: number,
  ): { total: number; detalle: any } {
    const total = (salarioMensual * diasTrabajados) / 360;

    return {
      total: this.round(total),
      detalle: {
        formula: '(Salario mensual × Días trabajados) ÷ 360',
        salarioMensual,
        diasTrabajados,
        calculo: `(${salarioMensual} × ${diasTrabajados}) ÷ 360 = ${this.round(total)}`,
        nota: 'Prima equivalente a 30 días de salario por año (15 días por semestre)',
      },
    };
  }

  /**
   * Calcula vacaciones según Art. 186 CST
   * Formula: (Salario mensual * Días trabajados) / 720
   * Nota: Son 15 días hábiles por año (equivalente a 22.5 días calendario)
   */
  private calcularVacaciones(
    salarioMensual: number,
    diasTrabajados: number,
  ): { total: number; detalle: any } {
    // Vacaciones: 15 días hábiles = 22.5 días calendario por año
    // Por tanto: (salario / 30) * 22.5 / 12 meses
    // Simplificado: (salario * días) / 720
    const total = (salarioMensual * diasTrabajados) / 720;

    return {
      total: this.round(total),
      detalle: {
        formula: '(Salario mensual × Días trabajados) ÷ 720',
        salarioMensual,
        diasTrabajados,
        calculo: `(${salarioMensual} × ${diasTrabajados}) ÷ 720 = ${this.round(total)}`,
        nota: '15 días hábiles de vacaciones por año (22.5 días calendario)',
      },
    };
  }

  /**
   * Calcula indemnización según Art. 64 CST
   * 
   * Despido sin justa causa:
   * - Contrato indefinido: 30 días de salario por cada año
   * - Contrato a término fijo: Valor de los salarios hasta la finalización del contrato
   * 
   * Terminación anticipada por empleado:
   * - La mitad de la indemnización por despido sin justa causa
   */
  private calcularIndemnizacion(
    salarioMensual: number,
    diasTrabajados: number,
    tipo: 'sin_justa_causa' | 'terminacion_anticipada',
    tipoContrato: string,
  ): { total: number; detalle: any } {
    let total = 0;
    let formula = '';
    let nota = '';

    if (tipo === 'sin_justa_causa') {
      if (tipoContrato === 'indefinido' || tipoContrato === 'Indefinido') {
        // 30 días por año trabajado
        const aniosTrabajados = diasTrabajados / 360;
        total = salarioMensual * aniosTrabajados;
        formula = 'Salario mensual × Años trabajados';
        nota = '30 días de salario por cada año de servicio (contrato indefinido)';
      } else {
        // Contrato a término fijo: salarios faltantes hasta el fin del contrato
        // Aquí deberíamos conocer la fecha fin del contrato, por simplicidad usamos proporcional
        const mesesTrabajados = diasTrabajados / 30;
        if (mesesTrabajados < 12) {
          // Si trabajó menos de un año, indemnización proporcional
          total = salarioMensual * (12 - mesesTrabajados);
          formula = `Salario mensual × Meses faltantes hasta completar año`;
          nota = 'Salarios correspondientes al tiempo faltante del contrato a término fijo';
        } else {
          total = 0;
          nota = 'Contrato a término fijo completado, no aplica indemnización';
        }
      }
    } else if (tipo === 'terminacion_anticipada') {
      // Terminación anticipada por el empleado: 50% de la indemnización por despido
      const indemnizacionBase = this.calcularIndemnizacion(
        salarioMensual,
        diasTrabajados,
        'sin_justa_causa',
        tipoContrato,
      );
      total = indemnizacionBase.total * 0.5;
      formula = 'Indemnización sin justa causa × 50%';
      nota = 'Retiro voluntario antes de cumplir el plazo pactado';
    }

    return {
      total: this.round(total),
      detalle: {
        formula,
        tipo,
        tipoContrato,
        salarioMensual,
        diasTrabajados,
        calculo: `${formula} = ${this.round(total)}`,
        nota,
      },
    };
  }

  /**
   * Obtiene el promedio salarial de los últimos 12 meses
   */
  private async getAverageSalary(contractId: string, fechaFin: Date): Promise<number | null> {
    const fecha12MesesAtras = new Date(fechaFin);
    fecha12MesesAtras.setMonth(fecha12MesesAtras.getMonth() - 12);

    const entries = await this.payrollEntryRepository.find({
      where: {
        // contractId, // Descomentar si PayrollEntry tiene contractId
        calculatedAt: Between(fecha12MesesAtras, fechaFin),
      },
      order: { calculatedAt: 'DESC' },
      take: 12,
    });

    if (entries.length === 0) {
      return null;
    }

    const sum = entries.reduce((acc, entry) => acc + Number(entry.salarioBase), 0);
    return sum / entries.length;
  }

  /**
   * Calcula días entre dos fechas
   */
  private calculateDays(fechaInicio: Date, fechaFin: Date): number {
    const start = fechaInicio instanceof Date ? fechaInicio : new Date(fechaInicio);
    const end = fechaFin instanceof Date ? fechaFin : new Date(fechaFin);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Redondea a 2 decimales
   */
  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
