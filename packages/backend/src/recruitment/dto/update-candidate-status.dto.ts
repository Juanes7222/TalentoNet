import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { CandidateStatus } from '../entities/candidate.entity';

export class UpdateCandidateStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del candidato',
    enum: CandidateStatus,
    example: CandidateStatus.PRESELECCIONADO,
  })
  @IsEnum(CandidateStatus)
  @IsNotEmpty()
  estado: CandidateStatus;

  @ApiProperty({ description: 'Comentario sobre el cambio de estado', required: false })
  @IsString()
  @IsOptional()
  comentario?: string;
}
