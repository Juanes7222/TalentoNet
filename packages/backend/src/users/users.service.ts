import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserStatus } from './user.entity';
import { Role } from './role.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { Invitation, InvitationType } from '../auth/entities/invitation.entity';
import { EmailService } from '../auth/services/email.service';
import { AuditService } from '../auth/services/audit.service';
import { AuditAction } from '../auth/entities/audit-log.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Invitation)
    private invitationsRepository: Repository<Invitation>,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async createEmployeeUser(email: string): Promise<User> {
    const existing = await this.usersRepository.findOne({ 
      where: { email },
      relations: ['roles', 'roles.permissions']
    });
    if (existing) {
      throw new ConflictException(`Usuario con email ${email} ya existe`);
    }

    const employeeRole = await this.rolesRepository.findOne({ where: { name: 'employee' } });
    if (!employeeRole) {
      throw new Error('Rol employee no encontrado');
    }

    // Password temporal (debe cambiarse en primer login)
    const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

    const user = this.usersRepository.create({
      email,
      passwordHash,
      status: UserStatus.ACTIVE,
      roles: [employeeRole],
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email }, 
      relations: ['roles', 'roles.permissions'] 
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id }, 
      relations: ['roles', 'roles.permissions'] 
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    if (!user.passwordHash) {
      // User is SSO-only
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? user : null;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { lastLogin: new Date() });
  }

  async create(dto: CreateUserDto, createdBy?: string): Promise<User> {
    // Check if email already exists
    const existing = await this.usersRepository.findOne({ 
      where: { email: dto.email },
      relations: ['roles', 'roles.permissions']
    });
    
    if (existing) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    // Get roles
    let roles: Role[] = [];
    if (dto.roleIds && dto.roleIds.length > 0) {
      roles = await this.rolesRepository.findByIds(dto.roleIds);
      if (roles.length !== dto.roleIds.length) {
        throw new NotFoundException('One or more roles not found');
      }
    } else {
      // Default to employee role
      const employeeRole = await this.rolesRepository.findOne({ 
        where: { name: 'employee' } 
      });
      if (employeeRole) {
        roles = [employeeRole];
      }
    }

    // Hash password if provided, otherwise use identification number
    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, 10);
    } else if (dto.identificationNumber) {
      // Use identification number as default password
      passwordHash = await bcrypt.hash(dto.identificationNumber, 10);
    }

    const user = this.usersRepository.create({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash,
      status: passwordHash ? UserStatus.ACTIVE : (dto.status || UserStatus.INVITED),
      employeeId: dto.employeeId,
      createdById: createdBy,
      roles,
    });

    const savedUser = await this.usersRepository.save(user);

    // Send invitation if requested and user is INVITED
    if (dto.sendInvitation !== false && savedUser.status === UserStatus.INVITED) {
      await this.sendInvitation(savedUser.id, createdBy);
    }

    // Audit log
    await this.auditService.log(AuditAction.CREATE_USER, {
      actorUserId: createdBy,
      resourceType: 'user',
      resourceId: savedUser.id,
      details: { email: savedUser.email, roles: roles.map(r => r.name) },
    });

    return this.findById(savedUser.id);
  }

  async update(id: string, dto: UpdateUserDto, updatedBy?: string): Promise<User> {
    const user = await this.findById(id);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findOne({ 
        where: { email: dto.email },
        relations: ['roles', 'roles.permissions']
      });
      
      if (existing) {
        throw new ConflictException(`User with email ${dto.email} already exists`);
      }
    }

    if (dto.roleIds) {
      const roles = await this.rolesRepository.findByIds(dto.roleIds);
      if (roles.length !== dto.roleIds.length) {
        throw new NotFoundException('One or more roles not found');
      }
      user.roles = roles;
    }

    Object.assign(user, {
      email: dto.email,
      fullName: dto.fullName,
      status: dto.status,
      employeeId: dto.employeeId,
      mfaEnabled: dto.mfaEnabled,
    });

    await this.usersRepository.save(user);

    // Audit log
    await this.auditService.log(AuditAction.UPDATE_USER, {
      actorUserId: updatedBy,
      resourceType: 'user',
      resourceId: user.id,
      details: { changes: dto },
    });

    return this.findById(id);
  }

  async delete(id: string, deletedBy?: string): Promise<void> {
    const user = await this.findById(id);

    // Soft delete: set status to INACTIVE
    user.status = UserStatus.INACTIVE;
    await this.usersRepository.save(user);

    // Audit log
    await this.auditService.log(AuditAction.DELETE_USER, {
      actorUserId: deletedBy,
      resourceType: 'user',
      resourceId: user.id,
      details: { email: user.email },
    });
  }

  async findAll(filters?: {
    email?: string;
    status?: UserStatus;
    roleId?: string;
    employeeId?: string;
    page?: number;
    limit?: number;
  }) {
    const { email, status, roleId, employeeId, page = 1, limit = 50 } = filters || {};

    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.employee', 'employee');

    if (email) {
      query.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    if (status) {
      query.andWhere('user.status = :status', { status });
    }

    if (roleId) {
      query.andWhere('role.id = :roleId', { roleId });
    }

    if (employeeId) {
      query.andWhere('user.employeeId = :employeeId', { employeeId });
    }

    query
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async assignRoles(userId: string, roleIds: string[], assignedBy?: string): Promise<User> {
    const user = await this.findById(userId);

    const roles = await this.rolesRepository.findByIds(roleIds);
    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    user.roles = roles;
    await this.usersRepository.save(user);

    // Audit log
    await this.auditService.log(AuditAction.ROLE_ASSIGN, {
      actorUserId: assignedBy,
      resourceType: 'user',
      resourceId: user.id,
      details: { roles: roles.map(r => r.name) },
    });

    return this.findById(userId);
  }

  async revokeRole(userId: string, roleId: string, revokedBy?: string): Promise<User> {
    const user = await this.findById(userId);

    user.roles = user.roles.filter(r => r.id !== roleId);
    await this.usersRepository.save(user);

    // Audit log
    await this.auditService.log(AuditAction.ROLE_REVOKE, {
      actorUserId: revokedBy,
      resourceType: 'user',
      resourceId: user.id,
      details: { roleId },
    });

    return this.findById(userId);
  }

  async suspend(userId: string, reason: string, suspendedBy?: string): Promise<User> {
    const user = await this.findById(userId);

    user.status = UserStatus.SUSPENDED;
    await this.usersRepository.save(user);

    // Send notification
    if (user.fullName) {
      await this.emailService.sendAccountSuspended(user.email, user.fullName, reason);
    }

    // Audit log
    await this.auditService.log(AuditAction.SUSPEND_USER, {
      actorUserId: suspendedBy,
      resourceType: 'user',
      resourceId: user.id,
      details: { reason },
    });

    return user;
  }

  async activate(userId: string, activatedBy?: string): Promise<User> {
    const user = await this.findById(userId);

    user.status = UserStatus.ACTIVE;
    await this.usersRepository.save(user);

    // Send notification
    if (user.fullName) {
      await this.emailService.sendAccountActivated(user.email, user.fullName);
    }

    // Audit log
    await this.auditService.log(AuditAction.ACTIVATE_USER, {
      actorUserId: activatedBy,
      resourceType: 'user',
      resourceId: user.id,
    });

    return user;
  }

  async sendInvitation(userId: string, invitedBy?: string): Promise<void> {
    const user = await this.findById(userId);

    if (user.status !== UserStatus.INVITED) {
      throw new BadRequestException('User is not in INVITED status');
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);

    // Create invitation
    const invitation = this.invitationsRepository.create({
      email: user.email,
      tokenHash,
      type: InvitationType.USER_INVITE,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      createdById: invitedBy,
    });

    await this.invitationsRepository.save(invitation);

    // Send email
    await this.emailService.sendInvitation(user.email, token, invitedBy);

    // Audit log
    await this.auditService.log(AuditAction.INVITE_SEND, {
      actorUserId: invitedBy,
      resourceType: 'user',
      resourceId: user.id,
      details: { email: user.email },
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(userId);

    if (!user.passwordHash) {
      throw new BadRequestException('User does not have a password (SSO-only)');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);

    // Audit log
    await this.auditService.log(AuditAction.PASSWORD_CHANGE, {
      actorUserId: userId,
      resourceType: 'user',
      resourceId: user.id,
    });
  }
}
