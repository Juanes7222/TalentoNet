import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../permission.entity';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto/role.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(dto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionsRepository.findOne({ 
      where: { name: dto.name } 
    });
    
    if (existing) {
      throw new ConflictException(`Permission with name "${dto.name}" already exists`);
    }

    const permission = this.permissionsRepository.create(dto);
    return this.permissionsRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionsRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne({ where: { id } });

    if (!permission) {
      throw new NotFoundException(`Permission with ID "${id}" not found`);
    }

    return permission;
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.permissionsRepository.findOne({ where: { name } });
  }

  async update(id: string, dto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findById(id);

    if (dto.name && dto.name !== permission.name) {
      const existing = await this.permissionsRepository.findOne({ 
        where: { name: dto.name } 
      });
      
      if (existing) {
        throw new ConflictException(`Permission with name "${dto.name}" already exists`);
      }
    }

    Object.assign(permission, dto);
    return this.permissionsRepository.save(permission);
  }

  async delete(id: string): Promise<void> {
    const permission = await this.findById(id);
    await this.permissionsRepository.remove(permission);
  }

  /**
   * Check if user has a specific permission
   */
  async checkUserPermission(userId: string, permissionName: string): Promise<boolean> {
    const count = await this.permissionsRepository
      .createQueryBuilder('permission')
      .innerJoin('permission.roles', 'role')
      .innerJoin('role.users', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('permission.name = :permissionName', { permissionName })
      .getCount();

    return count > 0;
  }

  /**
   * Get all permissions for a user (through their roles)
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    return this.permissionsRepository
      .createQueryBuilder('permission')
      .innerJoin('permission.roles', 'role')
      .innerJoin('role.users', 'user')
      .where('user.id = :userId', { userId })
      .distinct(true)
      .getMany();
  }
}
