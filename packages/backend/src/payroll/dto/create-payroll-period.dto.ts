import { IsNotEmpty, IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PayrollPeriodType } from '../entities/payroll-period.entity';

export class CreatePayrollPeriodDto {
  @ApiProperty({ enum: ['quincenal', 'mensual'], example: 'quincenal' })
  @IsEnum(['quincenal', 'mensual'])
  @IsNotEmpty()
  tipo: PayrollPeriodType;

  @ApiProperty({ example: '2024-11-01' })
  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @ApiProperty({ example: '2024-11-15' })
  @IsDateString()
  @IsNotEmpty()
  fechaFin: string;

  @ApiProperty({ example: 'Quincena noviembre 2024 - 1ra', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
