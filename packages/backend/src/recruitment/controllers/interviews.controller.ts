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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InterviewsService } from '../services/interviews.service';
import { CreateInterviewDto } from '../dto/create-interview.dto';
import { UpdateInterviewDto } from '../dto/update-interview.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Entrevistas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Programar nueva entrevista' })
  @ApiResponse({ status: 201, description: 'Entrevista programada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Candidato no encontrado' })
  async create(@Body() createInterviewDto: CreateInterviewDto, @Request() req: any) {
    return await this.interviewsService.create(createInterviewDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las entrevistas' })
  @ApiQuery({ name: 'candidateId', required: false, description: 'Filtrar por ID de candidato' })
  @ApiResponse({ status: 200, description: 'Lista de entrevistas' })
  async findAll(@Query('candidateId') candidateId?: string) {
    if (candidateId) {
      return await this.interviewsService.findByCandidate(candidateId);
    }
    return await this.interviewsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener entrevista por ID' })
  @ApiResponse({ status: 200, description: 'Entrevista encontrada' })
  @ApiResponse({ status: 404, description: 'Entrevista no encontrada' })
  async findOne(@Param('id') id: string) {
    return await this.interviewsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar entrevista' })
  @ApiResponse({ status: 200, description: 'Entrevista actualizada' })
  @ApiResponse({ status: 404, description: 'Entrevista no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateInterviewDto: UpdateInterviewDto,
  ) {
    return await this.interviewsService.update(id, updateInterviewDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar/eliminar entrevista' })
  @ApiResponse({ status: 204, description: 'Entrevista eliminada' })
  @ApiResponse({ status: 404, description: 'Entrevista no encontrada' })
  async remove(@Param('id') id: string) {
    await this.interviewsService.remove(id);
  }
}
