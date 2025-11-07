import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { CertificationStatus } from '../entities/certification-request.entity';

export class UpdateCertificationStatusDto {
  @ApiPropertyOptional({ description: 'Nuevo estado', enum: CertificationStatus })
  @IsEnum(CertificationStatus)
  @IsOptional()
  estado?: CertificationStatus;

  @ApiPropertyOptional({ description: 'ID del usuario que aprueba' })
  @IsUUID()
  @IsOptional()
  aprobadoPorId?: string;

  @ApiPropertyOptional({ description: 'Motivo de rechazo' })
  @IsString()
  @IsOptional()
  rechazadoMotivo?: string;
}
