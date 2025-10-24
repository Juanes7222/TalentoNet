import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VacanciesService } from '../services/vacancies.service';
import { CreateVacancyDto } from '../dto/create-vacancy.dto';
import { UpdateVacancyDto } from '../dto/update-vacancy.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { VacancyStatus } from '../entities/vacancy.entity';

@ApiTags('Vacantes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly vacanciesService: VacanciesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva vacante' })
  @ApiResponse({ status: 201, description: 'Vacante creada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createVacancyDto: CreateVacancyDto, @Request() req: any) {
    return await this.vacanciesService.create(createVacancyDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las vacantes' })
  @ApiResponse({ status: 200, description: 'Lista de vacantes' })
  async findAll(@Query('estado') estado?: VacancyStatus) {
    if (estado) {
      return await this.vacanciesService.findByStatus(estado);
    }
    return await this.vacanciesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener vacante por ID' })
  @ApiResponse({ status: 200, description: 'Vacante encontrada' })
  @ApiResponse({ status: 404, description: 'Vacante no encontrada' })
  async findOne(@Param('id') id: string) {
    return await this.vacanciesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar vacante' })
  @ApiResponse({ status: 200, description: 'Vacante actualizada' })
  @ApiResponse({ status: 404, description: 'Vacante no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateVacancyDto: UpdateVacancyDto,
  ) {
    return await this.vacanciesService.update(id, updateVacancyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar vacante' })
  @ApiResponse({ status: 204, description: 'Vacante eliminada' })
  @ApiResponse({ status: 404, description: 'Vacante no encontrada' })
  async remove(@Param('id') id: string) {
    await this.vacanciesService.remove(id);
  }
}
