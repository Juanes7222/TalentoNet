import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsUUID,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { RequesterType } from '../entities/certification-request.entity';

export class CreateCertificationDto {
  @ApiProperty({ description: 'Nombre del solicitante', example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  requesterNombre: string;

  @ApiProperty({ description: 'Email del solicitante', example: 'juan@example.com' })
  @IsEmail()
  @IsNotEmpty()
  requesterEmail: string;

  @ApiProperty({
    description: 'Tipo de solicitante',
    enum: RequesterType,
    example: RequesterType.EMPLEADO,
  })
  @IsEnum(RequesterType)
  @IsNotEmpty()
  requesterTipo: RequesterType;

  @ApiProperty({ description: 'ID del empleado', example: 'uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @ApiPropertyOptional({ description: 'Tipo de certificado', example: 'Certificado Laboral' })
  @IsString()
  @IsOptional()
  tipoCertificado?: string;

  @ApiProperty({ description: 'Motivo de la solicitud', example: 'Trámite bancario' })
  @IsString()
  @IsNotEmpty()
  motivo: string;

  @ApiPropertyOptional({ description: 'Incluir información salarial', default: false })
  @IsBoolean()
  @IsOptional()
  incluirSalario?: boolean;

  @ApiPropertyOptional({ description: 'Incluir cargo actual', default: true })
  @IsBoolean()
  @IsOptional()
  incluirCargo?: boolean;

  @ApiPropertyOptional({ description: 'Incluir tiempo de servicio', default: true })
  @IsBoolean()
  @IsOptional()
  incluirTiempoServicio?: boolean;

  @ApiPropertyOptional({ description: 'Consentimiento para datos sensibles', default: false })
  @IsBoolean()
  @IsOptional()
  consentimientoDatos?: boolean;

  @ApiPropertyOptional({ description: 'IP del solicitante' })
  @IsString()
  @IsOptional()
  ipAddress?: string;
}
