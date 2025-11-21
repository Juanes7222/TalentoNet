import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.usersService.updateLastLogin(user.id);

    const roles = user.roles.map(role => role.name);
    
    // Incluir roles con permisos en el payload del JWT
    const rolesWithPermissions = user.roles.map(role => ({
      id: role.id,
      name: role.name,
      permissions: role.permissions.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        resource: p.resource,
        action: p.action,
      })),
    }));
    
    const payload = { 
      sub: user.id, 
      email: user.email, 
      roles: rolesWithPermissions, // Roles completos con permisos
      roleNames: roles, // Array de nombres para compatibilidad
      // Keep singular 'role' for backward compatibility
      role: roles[0] || 'employee',
    };
    
    // Generar access token (expira en 15 minutos)
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    
    // Generar refresh token (expira en 7 días)
    const refreshToken = await this.generateRefreshToken(String(user.id));
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles, // Enviar roles completos con permisos
        role: roles[0] || 'employee', // backward compatibility
      },
    };
  }

  async validateToken(payload: any) {
    return this.usersService.findById(payload.sub);
  }

  async generateRefreshToken(userId: string): Promise<string> {
    // Generar token aleatorio seguro
    const token = crypto.randomBytes(32).toString('hex');
    
    // Hash del token para almacenar en BD
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Expiración en 7 días
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Guardar en base de datos
    await this.refreshTokenRepository.save({
      userId,
      refreshTokenHash: tokenHash,
      expiresAt,
    });
    
    return token;
  }

  async refreshAccessToken(refreshToken: string) {
    // Hash del token recibido
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    // Buscar token en BD
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { refreshTokenHash: tokenHash },
      relations: ['user', 'user.roles', 'user.roles.permissions'],
    });
    
    if (!storedToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    
    // Verificar si expiró
    if (storedToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.remove(storedToken);
      throw new UnauthorizedException('Refresh token expirado');
    }
    
    // Verificar si fue revocado
    if (storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token revocado');
    }
    
    const user = storedToken.user;
    const roles = user.roles.map(role => role.name);
    
    const rolesWithPermissions = user.roles.map(role => ({
      id: role.id,
      name: role.name,
      permissions: role.permissions.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        resource: p.resource,
        action: p.action,
      })),
    }));
    
    const payload = {
      sub: user.id,
      email: user.email,
      roles: rolesWithPermissions,
      roleNames: roles,
      role: roles[0] || 'employee',
    };
    
    // Generar nuevo access token
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    
    // Opcionalmente, rotar el refresh token (más seguro)
    const newRefreshToken = await this.generateRefreshToken(String(user.id));
    
    // Revocar el token anterior
    storedToken.revokedAt = new Date();
    await this.refreshTokenRepository.save(storedToken);
    
    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }
}
