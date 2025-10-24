import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsArray, Min } from 'class-validator';

export enum VacancyStatus {
  ABIERTA = 'abierta',
  CERRADA = 'cerrada',
  CANCELADA = 'cancelada',
}

export class CreateVacancyDto {
  @ApiProperty({ description: 'Departamento de la vacante', example: 'Desarrollo' })
  @IsString()
  @IsNotEmpty()
  departamento: string;

  @ApiProperty({ description: 'Nombre del cargo', example: 'Desarrollador Full Stack' })
  @IsString()
  @IsNotEmpty()
  cargo: string;

  @ApiProperty({ description: 'Descripción detallada de la vacante' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ description: 'Salario mínimo', example: 3000000 })
  @IsNumber()
  @Min(0)
  salarioMin: number;

  @ApiProperty({ description: 'Salario máximo', example: 5000000 })
  @IsNumber()
  @Min(0)
  salarioMax: number;

  @ApiProperty({
    description: 'Habilidades requeridas',
    example: ['TypeScript', 'NestJS', 'React'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  habilidadesRequeridas: string[];

  @ApiProperty({
    description: 'Estado de la vacante',
    enum: VacancyStatus,
    default: VacancyStatus.ABIERTA,
  })
  @IsEnum(VacancyStatus)
  @IsOptional()
  estado?: VacancyStatus;
}
