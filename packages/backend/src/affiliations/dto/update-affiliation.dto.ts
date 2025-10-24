import { IsEnum, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AffiliationStatus } from '../entities/affiliation.entity';

export class RetireAffiliationDto {
  @ApiPropertyOptional({
    description: 'Fecha de retiro',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  fechaRetiro?: string;

  @ApiPropertyOptional({
    description: 'Comentario sobre el retiro',
    example: 'Cambio de proveedor solicitado por el empleado',
  })
  @IsOptional()
  @IsString()
  comentario?: string;
}

export class UpdateAffiliationDto {
  @ApiPropertyOptional({
    description: 'Proveedor',
    example: 'Nueva EPS',
  })
  @IsOptional()
  @IsString()
  proveedor?: string;

  @ApiPropertyOptional({
    description: 'Estado de la afiliación',
    enum: AffiliationStatus,
  })
  @IsOptional()
  @IsEnum(AffiliationStatus)
  estado?: AffiliationStatus;

  @ApiPropertyOptional({
    description: 'Fecha de retiro',
  })
  @IsOptional()
  @IsDateString()
  fechaRetiro?: string;
}
