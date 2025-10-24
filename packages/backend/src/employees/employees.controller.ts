import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeFilterDto, EmployeeResponseDto } from './dto/employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles('admin', 'rh')
  @ApiOperation({ summary: 'Crear un nuevo empleado' })
  @ApiResponse({ status: 201, description: 'Empleado creado exitosamente', type: EmployeeResponseDto })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El empleado ya existe' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Roles('admin', 'rh')
  @ApiOperation({ summary: 'Listar todos los empleados con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Lista de empleados', type: [EmployeeResponseDto] })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre o identificación' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'city', required: false, description: 'Filtrar por ciudad' })
  @ApiQuery({ name: 'department', required: false, description: 'Filtrar por departamento' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Registros por página', example: 10 })
  async findAll(@Query() filters: EmployeeFilterDto) {
    return this.employeesService.findAll(filters);
  }

  @Get(':id')
  @Roles('admin', 'rh', 'employee')
  @ApiOperation({ summary: 'Obtener un empleado por ID' })
  @ApiResponse({ status: 200, description: 'Empleado encontrado', type: EmployeeResponseDto })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'rh')
  @ApiOperation({ summary: 'Actualizar datos de un empleado' })
  @ApiResponse({ status: 200, description: 'Empleado actualizado', type: EmployeeResponseDto })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto con datos existentes' })
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles('admin', 'rh')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactivar un empleado (soft delete)' })
  @ApiResponse({ status: 204, description: 'Empleado desactivado' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
