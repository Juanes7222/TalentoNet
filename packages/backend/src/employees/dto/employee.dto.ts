import { IsString, IsEmail, IsEnum, IsOptional, IsDateString, IsNotEmpty, Length, Matches, IsBoolean, IsNumber, Min, ValidateNested, IsObject, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IdentificationType, Gender, EmployeeStatus } from '../employee.entity';

/**
 * Validador personalizado para verificar edad mínima
 */
@ValidatorConstraint({ name: 'isOldEnough', async: false })
export class IsOldEnoughConstraint implements ValidatorConstraintInterface {
  validate(dateString: string, args: ValidationArguments) {
    const birthDate = new Date(dateString);
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return birthDate <= eighteenYearsAgo;
  }

  defaultMessage(args: ValidationArguments) {
    return 'El empleado debe tener al menos 18 años de edad';
  }
}

/**
 * Validador personalizado para verificar que la fecha de fin sea posterior a la de inicio
 */
@ValidatorConstraint({ name: 'isEndDateValid', async: false })
export class IsEndDateValidConstraint implements ValidatorConstraintInterface {
  validate(endDateString: string, args: ValidationArguments) {
    if (!endDateString) return true; // endDate es opcional
    
    const object = args.object as any;
    const startDate = new Date(object.startDate);
    const endDate = new Date(endDateString);
    
    return endDate > startDate;
  }

  defaultMessage(args: ValidationArguments) {
    return 'La fecha de fin del contrato debe ser posterior a la fecha de inicio';
  }
}

/**
 * DTO para información del contrato al crear empleado
 */
export class CreateEmployeeContractDto {
  @ApiProperty({ description: 'Tipo de contrato', example: 'indefinido', enum: ['indefinido', 'fijo', 'obra_labor', 'prestacion_servicios'] })
  @IsString()
  @IsNotEmpty()
  contractType: string;

  @ApiProperty({ description: 'Cargo', example: 'Desarrollador Senior' })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({ description: 'Departamento', example: 'Tecnología' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ description: 'Salario', example: 5000000 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  salary: number;

  @ApiProperty({ description: 'Fecha de inicio del contrato', example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({ description: 'Fecha de fin del contrato (solo para contratos fijos)', example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  @Validate(IsEndDateValidConstraint)
  endDate?: string;
}

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Tipo de identificación', enum: IdentificationType })
  @IsEnum(IdentificationType)
  @IsNotEmpty()
  identificationType: IdentificationType;

  @ApiProperty({ description: 'Número de identificación', example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  @Length(5, 50)
  identificationNumber: string;

  @ApiProperty({ description: 'Nombres', example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  firstName: string;

  @ApiProperty({ description: 'Apellidos', example: 'García' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  lastName: string;

  @ApiProperty({ description: 'Fecha de nacimiento', example: '1990-01-15' })
  @IsDateString()
  @IsNotEmpty()
  @Validate(IsOldEnoughConstraint)
  dateOfBirth: string;

  @ApiPropertyOptional({ description: 'Género', enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Teléfono', example: '3001234567' })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{7,20}$/, { message: 'Teléfono debe contener solo números (7-20 dígitos)' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Dirección', example: 'Calle 123 #45-67' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Ciudad', example: 'Bogotá' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Departamento', example: 'Cundinamarca' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ description: 'País', example: 'Colombia', default: 'Colombia' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ description: 'Fecha de contratación', example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  hireDate: string;

  @ApiPropertyOptional({ description: 'Email del empleado (opcional, si tendrá acceso al sistema)', example: 'juan.garcia@company.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Información del contrato (requerido)', type: CreateEmployeeContractDto })
  @ValidateNested()
  @Type(() => CreateEmployeeContractDto)
  @IsNotEmpty()
  contract: CreateEmployeeContractDto;
}

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ description: 'Tipo de identificación', enum: IdentificationType })
  @IsEnum(IdentificationType)
  @IsOptional()
  identificationType?: IdentificationType;

  @ApiPropertyOptional({ description: 'Número de identificación' })
  @IsString()
  @IsOptional()
  @Length(5, 50)
  identificationNumber?: string;

  @ApiPropertyOptional({ description: 'Nombres' })
  @IsString()
  @IsOptional()
  @Length(2, 100)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Apellidos' })
  @IsString()
  @IsOptional()
  @Length(2, 100)
  lastName?: string;

  @ApiPropertyOptional({ description: 'Fecha de nacimiento' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Género', enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Teléfono' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Dirección' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Ciudad' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Departamento' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ description: 'País' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Fecha de terminación' })
  @IsDateString()
  @IsOptional()
  terminationDate?: string;

  @ApiPropertyOptional({ description: 'Estado del empleado', enum: EmployeeStatus })
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}

export class EmployeeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  identificationType: string;

  @ApiProperty()
  identificationNumber: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  dateOfBirth: string;

  @ApiProperty()
  age: number;

  @ApiPropertyOptional()
  gender?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  department?: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  hireDate: string;

  @ApiPropertyOptional()
  terminationDate?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class EmployeeFilterDto {
  @ApiPropertyOptional({ description: 'Buscar por nombre o identificación' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por estado', enum: EmployeeStatus })
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;

  @ApiPropertyOptional({ description: 'Filtrar por ciudad' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Filtrar por departamento' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ description: 'Página', example: 1, default: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Tamaño de página', example: 10, default: 10 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number;
}
