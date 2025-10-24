import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AffiliationType, AffiliationStatus } from '../entities/affiliation.entity';

export class AffiliationFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por tipo de afiliación',
    enum: AffiliationType,
  })
  @IsOptional()
  @IsEnum(AffiliationType)
  tipo?: AffiliationType;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: AffiliationStatus,
  })
  @IsOptional()
  @IsEnum(AffiliationStatus)
  estado?: AffiliationStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por proveedor',
    example: 'Sanitas',
  })
  @IsOptional()
  @IsString()
  proveedor?: string;

  @ApiPropertyOptional({
    description: 'Período de reporte (formato YYYY-MM)',
    example: '2024-10',
  })
  @IsOptional()
  @IsString()
  period?: string;
}
