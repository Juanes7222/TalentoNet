import { IsNotEmpty, IsNumber, IsString, IsDateString, IsEnum, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NovedadCategoria } from '../entities/payroll-novedad.entity';

export class CreateNovedadDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ example: 'horas_extras_diurnas' })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({ enum: ['devengo', 'deduccion'], example: 'devengo' })
  @IsEnum(['devengo', 'deduccion'])
  @IsNotEmpty()
  categoria: NovedadCategoria;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  valor: number;

  @ApiProperty({ example: 8, description: 'Cantidad (ej: horas extras)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  cantidad?: number;

  @ApiProperty({ example: '2024-11-10' })
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({ example: 'Horas extras por proyecto urgente', required: false })
  @IsString()
  @IsOptional()
  comentario?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: any;
}

export class BulkCreateNovedadesDto {
  @ApiProperty({ type: [CreateNovedadDto] })
  novedades: CreateNovedadDto[];
}
