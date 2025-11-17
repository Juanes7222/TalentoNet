import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'ADMIN', description: 'Role name (unique)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Administrator role with full access' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String], example: ['permission-uuid-1'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'ADMIN' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Administrator role with full access' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class AssignPermissionsDto {
  @ApiProperty({ type: [String], example: ['permission-uuid-1', 'permission-uuid-2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}

export class CreatePermissionDto {
  @ApiProperty({ example: 'users.create', description: 'Permission name (unique)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Ability to create new users' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({ example: 'users.create' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Ability to create new users' })
  @IsOptional()
  @IsString()
  description?: string;
}
