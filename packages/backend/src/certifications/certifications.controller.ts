import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  Res,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { CertificationsService } from './certifications.service';
import { CreateCertificationDto, UpdateCertificationStatusDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CertificationStatus } from './entities/certification-request.entity';
import * as fs from 'fs';

@ApiTags('Certifications')
@Controller('certifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Solicitar una certificación laboral' })
  @ApiResponse({ status: 201, description: 'Solicitud creada exitosamente' })
  async create(@Body() createDto: CreateCertificationDto) {
    return await this.certificationsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las solicitudes de certificación' })
  @ApiResponse({ status: 200, description: 'Lista de certificaciones' })
  async findAll(
    @Query('employeeId') employeeId?: string,
    @Query('estado') estado?: CertificationStatus,
    @Query('requesterEmail') requesterEmail?: string,
  ) {
    return await this.certificationsService.findAll({
      employeeId,
      estado,
      requesterEmail,
    });
  }

  @Post(':id/generate')
  @ApiOperation({ summary: 'Generar PDF de la certificación' })
  @ApiResponse({ status: 200, description: 'PDF generado exitosamente' })
  @HttpCode(HttpStatus.OK)
  async generatePdf(@Param('id') id: string) {
    return await this.certificationsService.generatePdf(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Descargar el PDF de la certificación' })
  @ApiResponse({ status: 200, description: 'PDF descargado' })
  @ApiResponse({ status: 404, description: 'PDF no encontrado' })
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const filepath = await this.certificationsService.getPdfPath(id);
    const certification = await this.certificationsService.findOne(id);

    const fileStream = fs.createReadStream(filepath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificacion-${certification.employee.firstName}-${certification.employee.lastName}.pdf"`,
    );

    fileStream.pipe(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una certificación por ID' })
  @ApiResponse({ status: 200, description: 'Certificación encontrada' })
  @ApiResponse({ status: 404, description: 'Certificación no encontrada' })
  async findOne(@Param('id') id: string) {
    return await this.certificationsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar el estado de una certificación' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  async updateStatus(@Param('id') id: string, @Body() updateDto: UpdateCertificationStatusDto) {
    return await this.certificationsService.updateStatus(id, updateDto);
  }
}
