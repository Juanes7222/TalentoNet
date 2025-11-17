import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { RolesService } from './services/roles.service';
import { PermissionsService } from './services/permissions.service';
import { UsersController } from './users.controller';
import { RolesController, PermissionsController } from './roles.controller';
import { User } from './user.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { Invitation } from '../auth/entities/invitation.entity';
import { AuditLog } from '../auth/entities/audit-log.entity';
import { AuditService } from '../auth/services/audit.service';
import { EmailService } from '../auth/services/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, Invitation, AuditLog]),
  ],
  controllers: [UsersController, RolesController, PermissionsController],
  providers: [UsersService, RolesService, PermissionsService, AuditService, EmailService],
  exports: [UsersService, RolesService, PermissionsService],
})
export class UsersModule {}
