import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, AssignRolesDto, ChangePasswordDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserStatus } from './user.entity';

@ApiTags('users')
@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Permissions('users.create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() dto: CreateUserDto, @CurrentUser('id') userId: string) {
    return this.usersService.create(dto, userId);
  }

  @Get()
  @Permissions('users.read')
  @ApiOperation({ summary: 'List all users with filters' })
  async findAll(
    @Query('email') email?: string,
    @Query('status') status?: UserStatus,
    @Query('roleId') roleId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.findAll({
      email,
      status,
      roleId,
      employeeId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Permissions('users.update')
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.update(id, dto, userId);
  }

  @Delete(':id')
  @Permissions('users.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.usersService.delete(id, userId);
  }

  @Post(':id/invite')
  @Permissions('users.invite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send invitation email to user' })
  async sendInvitation(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.usersService.sendInvitation(id, userId);
    return { message: 'Invitation sent successfully' };
  }

  @Post(':id/roles')
  @Permissions('roles.manage')
  @ApiOperation({ summary: 'Assign roles to user' })
  async assignRoles(
    @Param('id') id: string,
    @Body() dto: AssignRolesDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.assignRoles(id, dto.roleIds, userId);
  }

  @Delete(':id/roles/:roleId')
  @Permissions('roles.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke role from user' })
  async revokeRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.revokeRole(id, roleId, userId);
  }

  @Patch(':id/suspend')
  @Permissions('users.suspend')
  @ApiOperation({ summary: 'Suspend user account' })
  async suspend(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.suspend(id, reason, userId);
  }

  @Patch(':id/activate')
  @Permissions('users.suspend')
  @ApiOperation({ summary: 'Activate user account' })
  async activate(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.usersService.activate(id, userId);
  }

  @Post(':id/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(id, dto.currentPassword, dto.newPassword);
    return { message: 'Password changed successfully' };
  }
}
