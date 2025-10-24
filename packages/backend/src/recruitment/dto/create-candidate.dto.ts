import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  Length,
} from 'class-validator';
import { CandidateStatus } from '../entities/candidate.entity';

export class CreateCandidateDto {
  @ApiProperty({ description: 'UUID de la vacante', example: 'uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  vacancyId: string;

  @ApiProperty({ description: 'Nombre completo del candidato', example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Apellido del candidato', example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({ description: 'Número de cédula', example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  cedula: string;

  @ApiProperty({ description: 'Correo electrónico', example: 'juan.perez@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Número de teléfono', example: '+573001234567' })
  @IsPhoneNumber('CO')
  @IsNotEmpty()
  telefono: string;

  @ApiProperty({ description: 'Fecha de nacimiento', example: '1990-01-15' })
  @IsDateString()
  @IsOptional()
  fechaNacimiento?: string;

  @ApiPropertyOptional({
    description: 'Estado del candidato',
    enum: CandidateStatus,
    default: CandidateStatus.POSTULADO,
  })
  @IsEnum(CandidateStatus)
  @IsOptional()
  estadoProceso?: CandidateStatus;

  @ApiPropertyOptional({ description: 'Observaciones sobre el candidato' })
  @IsString()
  @IsOptional()
  notas?: string;
}
