import { Controller, Post, Body, Get, UseGuards, Request, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

export class LoginDto {
  @ApiProperty({ example: 'admin@talentonet.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'your-refresh-token-here' })
  @IsString()
  refresh_token: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login con email y password' })
  @ApiResponse({ status: 200, description: 'Token JWT retornado' })
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  @ApiResponse({ status: 200, description: 'Nuevo access token retornado' })
  @HttpCode(200)
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshDto.refresh_token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  async getProfile(@Request() req: any) {
    // El JWT strategy retorna userId, no id
    const userId = req.user.userId || req.user.id;
    console.log('🔍 GET /auth/me - Usuario del token:', { 
      userId, 
      email: req.user.email,
      fullUser: req.user 
    });
    
    // Cargar el usuario completo con todas las relaciones
    const user = await this.usersService.findById(userId);
    
    console.log('👤 Usuario encontrado:', { 
      id: user.id, 
      email: user.email,
      roles: user.roles?.map(r => r.name) 
    });
    
    return user;
  }
}
