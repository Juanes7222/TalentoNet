import { IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LiquidatePayrollDto {
  @ApiProperty({
    description: 'IDs de empleados a liquidar. Si no se especifica, liquida todos los activos',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  employeeIds?: string[];
}

export class ApprovePayrollDto {
  @ApiProperty({
    description: 'Comentarios de la aprobación',
    example: 'Aprobado para pago',
    required: false,
  })
  @IsOptional()
  comentario?: string;
}

export class ClosePayrollDto {
  @ApiProperty({
    description: 'Comentarios del cierre',
    example: 'Período cerrado, pagos completados',
    required: false,
  })
  @IsOptional()
  comentario?: string;
}
