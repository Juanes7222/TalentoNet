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
  Ip,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CandidatesService } from '../services/candidates.service';
import { CreateCandidateDto } from '../dto/create-candidate.dto';
import { UpdateCandidateStatusDto } from '../dto/update-candidate-status.dto';
import { CandidateFilterDto } from '../dto/candidate-filter.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Candidatos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar nuevo candidato' })
  @ApiResponse({ status: 201, description: 'Candidato registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Candidato ya existe' })
  async create(@Body() createCandidateDto: CreateCandidateDto) {
    return await this.candidatesService.create(createCandidateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar candidatos con filtros' })
  @ApiQuery({ name: 'vacancyId', required: false, description: 'Filtrar por ID de vacante' })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por texto' })
  @ApiResponse({ status: 200, description: 'Lista de candidatos' })
  async findAll(@Query() filters: CandidateFilterDto) {
    return await this.candidatesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener candidato por ID' })
  @ApiResponse({ status: 200, description: 'Candidato encontrado' })
  @ApiResponse({ status: 404, description: 'Candidato no encontrado' })
  async findOne(@Param('id') id: string) {
    return await this.candidatesService.findOne(id);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Actualizar estado del candidato' })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Estado inválido' })
  @ApiResponse({ status: 404, description: 'Candidato no encontrado' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCandidateStatusDto,
    @Request() req: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return await this.candidatesService.updateStatus(id, updateStatusDto, req.user.userId, {
      ipAddress: ip,
      userAgent,
    });
  }

  @Get(':id/historial')
  @ApiOperation({ summary: 'Obtener historial de cambios de estado' })
  @ApiResponse({ status: 200, description: 'Historial de cambios' })
  @ApiResponse({ status: 404, description: 'Candidato no encontrado' })
  async getStateHistory(@Param('id') id: string) {
    return await this.candidatesService.getStateHistory(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar candidato' })
  @ApiResponse({ status: 204, description: 'Candidato eliminado' })
  @ApiResponse({ status: 404, description: 'Candidato no encontrado' })
  async remove(@Param('id') id: string) {
    await this.candidatesService.remove(id);
  }
}
