import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
    
    return {
      access_token: this.jwtService.sign(payload),
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
}
