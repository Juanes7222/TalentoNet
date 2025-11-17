import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsArray, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name of the user' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'Password123!', description: 'Password (optional if SSO-only)' })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @ApiPropertyOptional({ enum: UserStatus, example: UserStatus.INVITED, description: 'Initial status' })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ type: [String], example: ['role-uuid'], description: 'Array of role IDs' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds?: string[];

  @ApiPropertyOptional({ example: 'employee-uuid', description: 'Linked employee ID' })
  @IsOptional()
  @IsUUID('4')
  employeeId?: string;

  @ApiPropertyOptional({ example: false, description: 'Send invitation email' })
  @IsOptional()
  @IsBoolean()
  sendInvitation?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  employeeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  mfaEnabled?: boolean;
}

export class AssignRolesDto {
  @ApiProperty({ type: [String], example: ['role-uuid-1', 'role-uuid-2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds: string[];
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPassword123!' })
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
