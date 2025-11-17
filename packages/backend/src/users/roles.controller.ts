import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './services/roles.service';
import { PermissionsService } from './services/permissions.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('roles')
@Controller('api/roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
  ) {}

  @Post()
  @Permissions('roles.manage')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  async createRole(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  @Permissions('users.read')
  @ApiOperation({ summary: 'List all roles' })
  async findAllRoles() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get role by ID' })
  async findOneRole(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }

  @Patch(':id')
  @Permissions('roles.manage')
  @ApiOperation({ summary: 'Update role' })
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('roles.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete role' })
  async deleteRole(@Param('id') id: string) {
    await this.rolesService.delete(id);
  }

  @Post(':id/permissions')
  @Permissions('roles.manage')
  @ApiOperation({ summary: 'Assign permissions to role' })
  async assignPermissions(@Param('id') id: string, @Body() dto: AssignPermissionsDto) {
    return this.rolesService.assignPermissions(id, dto.permissionIds);
  }

  @Delete(':id/permissions/:permissionId')
  @Permissions('roles.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke permission from role' })
  async revokePermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
    return this.rolesService.revokePermission(id, permissionId);
  }

  @Get(':id/permissions')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get role permissions' })
  async getRolePermissions(@Param('id') id: string) {
    return this.rolesService.getRolePermissions(id);
  }
}

@ApiTags('permissions')
@Controller('api/permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Post()
  @Permissions('roles.manage')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  async create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Get()
  @Permissions('users.read')
  @ApiOperation({ summary: 'List all permissions' })
  async findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get permission by ID' })
  async findOne(@Param('id') id: string) {
    return this.permissionsService.findById(id);
  }

  @Patch(':id')
  @Permissions('roles.manage')
  @ApiOperation({ summary: 'Update permission' })
  async update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('roles.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete permission' })
  async delete(@Param('id') id: string) {
    await this.permissionsService.delete(id);
  }
}
