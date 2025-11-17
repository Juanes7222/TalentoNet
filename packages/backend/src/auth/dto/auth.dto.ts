import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'User password' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: false, description: 'Remember device for MFA' })
  @IsOptional()
  @IsBoolean()
  rememberDevice?: boolean;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Token expiration in seconds' })
  expiresIn: number;

  @ApiPropertyOptional({ description: 'Whether MFA is required', default: false })
  mfaRequired?: boolean;

  @ApiPropertyOptional({ description: 'Temporary token for MFA verification' })
  tempToken?: string;

  @ApiProperty({ description: 'User information' })
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
  };
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refreshToken: string;
}

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email address' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token from email' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewPassword123!', description: 'New password' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class SetPasswordDto {
  @ApiProperty({ description: 'Invitation token from email' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'Password123!', description: 'New password' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class VerifyMfaDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Temporary token from login' })
  @IsString()
  tempToken: string;

  @ApiProperty({ description: 'TOTP code from authenticator app', example: '123456' })
  @IsString()
  @MinLength(6)
  code: string;
}

export class EnableMfaDto {
  @ApiProperty({ description: 'TOTP code to verify setup', example: '123456' })
  @IsString()
  @MinLength(6)
  code: string;
}

export class DisableMfaDto {
  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'TOTP code from authenticator app', example: '123456' })
  @IsString()
  @MinLength(6)
  code: string;
}

export class LogoutDto {
  @ApiProperty({ description: 'Refresh token to revoke' })
  @IsString()
  refreshToken: string;
}
