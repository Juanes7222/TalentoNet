import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsOptional,
  IsDateString,
  IsArray,
} from 'class-validator';

export enum InterviewType {
  TELEFONICA = 'telefonica',
  PRESENCIAL = 'presencial',
  VIRTUAL = 'virtual',
  TECNICA = 'tecnica',
  PSICOTECNICA = 'psicotecnica',
}

export enum InterviewResult {
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
  PENDIENTE = 'pendiente',
}

export enum InterviewStatus {
  PROGRAMADA = 'programada',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  REPROGRAMADA = 'reprogramada',
}

export class CreateInterviewDto {
  @ApiProperty({ description: 'UUID del candidato', example: 'uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  candidateId: string;

  @ApiProperty({
    description: 'Tipo de entrevista',
    enum: InterviewType,
    example: InterviewType.PRESENCIAL,
  })
  @IsEnum(InterviewType)
  @IsNotEmpty()
  tipo: InterviewType;

  @ApiProperty({ description: 'Fecha y hora programada', example: '2024-02-01T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @ApiPropertyOptional({
    description: 'Estado de la entrevista',
    enum: InterviewStatus,
    default: InterviewStatus.PROGRAMADA,
  })
  @IsEnum(InterviewStatus)
  @IsOptional()
  estado?: InterviewStatus;

  @ApiPropertyOptional({
    description: 'Resultado de la entrevista',
    enum: InterviewResult,
    default: InterviewResult.PENDIENTE,
  })
  @IsEnum(InterviewResult)
  @IsOptional()
  resultado?: InterviewResult;

  @ApiPropertyOptional({ description: 'Fortalezas identificadas', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fortalezas?: string[];

  @ApiPropertyOptional({ description: 'Debilidades identificadas', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  debilidades?: string[];

  @ApiPropertyOptional({ description: 'Notas de la entrevista' })
  @IsString()
  @IsOptional()
  notas?: string;
}
