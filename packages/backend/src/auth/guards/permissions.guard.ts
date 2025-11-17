import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRoles = user.roles || [];
    const userPermissions = new Set<string>();

    // Collect all permissions from all user roles
    for (const role of userRoles) {
      const roleObj = typeof role === 'string' ? null : role;
      const permissions = roleObj?.permissions || [];
      
      for (const permission of permissions) {
        const permissionName = typeof permission === 'string' ? permission : permission.name;
        userPermissions.add(permissionName);
      }
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `User does not have required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
