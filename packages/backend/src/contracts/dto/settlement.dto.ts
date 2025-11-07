import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSettlementDto {
  @ApiPropertyOptional({ description: 'Fecha efectiva de la liquidación (por defecto hoy)' })
  @IsOptional()
  @IsDateString()
  fechaLiquidacion?: string;

  @ApiPropertyOptional({ description: 'Tipo de indemnización si aplica' })
  @IsOptional()
  @IsEnum(['sin_justa_causa', 'terminacion_anticipada'])
  tipoIndemnizacion?: 'sin_justa_causa' | 'terminacion_anticipada';

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  notas?: string;
}

export class UpdateSettlementDto {
  @ApiPropertyOptional({ description: 'Cesantías (ajuste manual)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cesantias?: number;

  @ApiPropertyOptional({ description: 'Intereses sobre cesantías (ajuste manual)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  interesesCesantias?: number;

  @ApiPropertyOptional({ description: 'Prima de servicios (ajuste manual)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  primaServicios?: number;

  @ApiPropertyOptional({ description: 'Vacaciones (ajuste manual)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  vacaciones?: number;

  @ApiPropertyOptional({ description: 'Indemnización (ajuste manual)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  indemnizacion?: number;

  @ApiPropertyOptional({ description: 'Otros conceptos adicionales' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  otrosConceptos?: number;

  @ApiPropertyOptional({ description: 'Deducciones a aplicar' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deducciones?: number;

  @ApiPropertyOptional({ description: 'Justificación para ajustes manuales' })
  @IsOptional()
  @IsString()
  justificacion?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notas?: string;
}

export class ApproveSettlementDto {
  @ApiPropertyOptional({ description: 'Comentarios de aprobación' })
  @IsOptional()
  @IsString()
  comentarios?: string;
}

export class RejectSettlementDto {
  @ApiProperty({ description: 'Motivo del rechazo' })
  @IsString()
  motivo: string;
}

export class MarkAsPaidDto {
  @ApiProperty({ description: 'Referencia del pago realizado' })
  @IsString()
  referenciaPago: string;

  @ApiPropertyOptional({ description: 'Fecha del pago' })
  @IsOptional()
  @IsDateString()
  fechaPago?: string;
}
