import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsString } from 'class-validator';
import { CandidateStatus } from '../entities/candidate.entity';

export class CandidateFilterDto {
  @ApiPropertyOptional({ description: 'Filtrar por UUID de vacante' })
  @IsUUID()
  @IsOptional()
  vacancyId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del candidato',
    enum: CandidateStatus,
  })
  @IsEnum(CandidateStatus)
  @IsOptional()
  estado?: CandidateStatus;

  @ApiPropertyOptional({ description: 'Buscar por nombre, apellido, cédula o email' })
  @IsString()
  @IsOptional()
  search?: string;
}
