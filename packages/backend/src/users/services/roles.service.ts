import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../role.entity';
import { Permission } from '../permission.entity';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from '../dto/role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    // Check if role name already exists
    const existing = await this.rolesRepository.findOne({ 
      where: { name: dto.name } 
    });
    
    if (existing) {
      throw new ConflictException(`Role with name "${dto.name}" already exists`);
    }

    const role = this.rolesRepository.create({
      name: dto.name,
      description: dto.description,
    });

    const savedRole = await this.rolesRepository.save(role);

    // Assign permissions if provided
    if (dto.permissionIds && dto.permissionIds.length > 0) {
      await this.assignPermissions(savedRole.id, dto.permissionIds);
      return this.findById(savedRole.id);
    }

    return savedRole;
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.rolesRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);

    if (dto.name && dto.name !== role.name) {
      const existing = await this.rolesRepository.findOne({ 
        where: { name: dto.name } 
      });
      
      if (existing) {
        throw new ConflictException(`Role with name "${dto.name}" already exists`);
      }
    }

    Object.assign(role, dto);
    await this.rolesRepository.save(role);

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const role = await this.findById(id);

    // Check if role is a system role (admin, rrhh, etc.)
    const systemRoles = ['admin', 'rrhh', 'contabilidad', 'gerencia', 'employee'];
    if (systemRoles.includes(role.name.toLowerCase())) {
      throw new ConflictException(`Cannot delete system role "${role.name}"`);
    }

    await this.rolesRepository.remove(role);
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    const role = await this.findById(roleId);

    const permissions = await this.permissionsRepository.findByIds(permissionIds);

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    role.permissions = permissions;
    await this.rolesRepository.save(role);

    return this.findById(roleId);
  }

  async revokePermission(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.findById(roleId);

    role.permissions = role.permissions.filter(p => p.id !== permissionId);
    await this.rolesRepository.save(role);

    return this.findById(roleId);
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await this.findById(roleId);
    return role.permissions;
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    return this.rolesRepository
      .createQueryBuilder('role')
      .innerJoin('role.users', 'user')
      .where('user.id = :userId', { userId })
      .leftJoinAndSelect('role.permissions', 'permission')
      .getMany();
  }
}
