import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollConfig } from '../entities/payroll-config.entity';

/**
 * Servicio para gestionar configuración parametrizable de nómina
 */
@Injectable()
export class PayrollConfigService {
  private readonly logger = new Logger(PayrollConfigService.name);

  constructor(
    @InjectRepository(PayrollConfig)
    private readonly configRepository: Repository<PayrollConfig>,
  ) {}

  /**
   * Obtiene un valor de configuración por clave
   */
  async getConfigValue<T = any>(key: string): Promise<T | null> {
    const config = await this.configRepository.findOne({ where: { key } });
    return config ? config.value : null;
  }

  /**
   * Obtiene porcentaje de salud del empleado
   */
  async getPorcentajeSalud(): Promise<number> {
    const config = await this.getConfigValue<{ value: number }>('porcentaje_salud_empleado');
    return config?.value || 4.0; // Default 4%
  }

  /**
   * Obtiene porcentaje de pensión del empleado
   */
  async getPorcentajePension(): Promise<number> {
    const config = await this.getConfigValue<{ value: number }>('porcentaje_pension_empleado');
    return config?.value || 4.0; // Default 4%
  }

  /**
   * Obtiene porcentaje de fondo de solidaridad
   */
  async getPorcentajeFondoSolidaridad(): Promise<number> {
    const config = await this.getConfigValue<{ value: number }>('porcentaje_fondo_solidaridad');
    return config?.value || 1.0; // Default 1%
  }

  /**
   * Obtiene salario mínimo legal vigente
   */
  async getSalarioMinimo(): Promise<number> {
    const config = await this.getConfigValue<{ value: number }>('salario_minimo_legal');
    return config?.value || 1300000; // Default 2024
  }

  /**
   * Obtiene valor del auxilio de transporte
   */
  async getAuxilioTransporte(): Promise<number> {
    const config = await this.getConfigValue<{ value: number }>('auxilio_transporte');
    return config?.value || 162000; // Default 2024
  }

  /**
   * Obtiene recargo de hora extra diurna
   */
  async getRecargoHoraExtraDiurna(): Promise<number> {
    const config = await this.getConfigValue<{ value: number }>('horas_extras_recargo_diurno');
    return config?.value || 25; // Default 25%
  }

  /**
   * Obtiene recargo de hora extra nocturna
   */
  async getRecargoHoraExtraNocturna(): Promise<number> {
    const config = await this.getConfigValue<{ value: number }>('horas_extras_recargo_nocturno');
    return config?.value || 75; // Default 75%
  }

  /**
   * Obtiene recargo de hora dominical/festiva
   */
  async getRecargoHoraDominical(): Promise<number> {
    const config = await this.getConfigValue<{ value: number }>('horas_extras_recargo_dominical');
    return config?.value || 75; // Default 75%
  }

  /**
   * Obtiene base para retención en la fuente
   */
  async getBaseRetencionFuente(): Promise<{ uvt: number; uvtValue: number }> {
    const config = await this.getConfigValue<{ uvt: number; uvt_value: number }>('retencion_fuente_base');
    return {
      uvt: config?.uvt || 95,
      uvtValue: config?.uvt_value || 42412,
    };
  }

  /**
   * Actualiza un valor de configuración
   */
  async updateConfig(key: string, value: any, updatedBy: number): Promise<PayrollConfig> {
    let config = await this.configRepository.findOne({ where: { key } });
    
    if (config) {
      config.value = value;
      config.updatedBy = updatedBy;
    } else {
      config = this.configRepository.create({ key, value, updatedBy });
    }
    
    return await this.configRepository.save(config);
  }

  /**
   * Obtiene todos los parámetros de configuración
   */
  async getAllConfig(): Promise<PayrollConfig[]> {
    return await this.configRepository.find({
      order: { key: 'ASC' },
    });
  }
}
