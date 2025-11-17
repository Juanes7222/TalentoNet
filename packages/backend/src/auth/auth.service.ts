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
    const payload = { 
      sub: user.id, 
      email: user.email, 
      roles: roles,
      // Keep singular 'role' for backward compatibility
      role: roles[0] || 'employee',
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        roles: roles,
        role: roles[0] || 'employee', // backward compatibility
      },
    };
  }

  async validateToken(payload: any) {
    return this.usersService.findById(payload.sub);
  }
}
