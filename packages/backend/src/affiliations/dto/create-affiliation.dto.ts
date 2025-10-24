import { IsEnum, IsString, IsDateString, IsBoolean, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AffiliationType } from '../entities/affiliation.entity';

export class CreateAffiliationDto {
  @ApiProperty({ description: 'ID del empleado', example: 'uuid' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({
    description: 'Tipo de afiliación',
    enum: AffiliationType,
    example: AffiliationType.EPS,
  })
  @IsEnum(AffiliationType)
  tipo: AffiliationType;

  @ApiProperty({ description: 'Nombre del proveedor', example: 'EPS Sanitas' })
  @IsString()
  @MaxLength(200)
  proveedor: string;

  @ApiPropertyOptional({ description: 'Código del proveedor', example: 'EPS001' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  codigoProveedor?: string;

  @ApiProperty({
    description: 'Número de afiliación (se cifrará automáticamente)',
    example: '123456789012',
  })
  @IsString()
  @MaxLength(100)
  numeroAfiliacion: string;

  @ApiProperty({
    description: 'Fecha de afiliación',
    example: '2024-01-15',
  })
  @IsDateString()
  fechaAfiliacion: string;

  @ApiProperty({
    description: 'Consentimiento ARCO del empleado',
    example: true,
  })
  @IsBoolean()
  consentimientoArco: boolean;

  @ApiPropertyOptional({
    description: 'Archivo del comprobante (se sube por separado)',
  })
  @IsOptional()
  comprobanteFile?: Express.Multer.File;
}
