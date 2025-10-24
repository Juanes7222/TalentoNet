import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AffiliationsService } from '../services/affiliations.service';
import { CreateAffiliationDto } from '../dto/create-affiliation.dto';
import { RetireAffiliationDto } from '../dto/update-affiliation.dto';
import { AffiliationFilterDto } from '../dto/affiliation-filter.dto';
import { AffiliationType } from '../entities/affiliation.entity';

@ApiTags('Afiliaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('affiliations')
export class AffiliationsController {
  constructor(private readonly affiliationsService: AffiliationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva afiliación con comprobante' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        employeeId: { type: 'string', format: 'uuid' },
        tipo: { type: 'string', enum: ['ARL', 'EPS', 'AFP', 'CAJA'] },
        proveedor: { type: 'string' },
        codigoProveedor: { type: 'string' },
        numeroAfiliacion: { type: 'string' },
        fechaAfiliacion: { type: 'string', format: 'date' },
        consentimientoArco: { type: 'boolean' },
        comprobante: { type: 'string', format: 'binary' },
      },
      required: ['employeeId', 'tipo', 'proveedor', 'numeroAfiliacion', 'fechaAfiliacion', 'consentimientoArco', 'comprobante'],
    },
  })
  @ApiResponse({ status: 201, description: 'Afiliación creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o falta comprobante' })
  @ApiResponse({ status: 409, description: 'Ya existe una afiliación activa del mismo tipo' })
  @UseInterceptors(FileInterceptor('comprobante'))
  async create(
    @Body() createDto: CreateAffiliationDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('El comprobante es obligatorio');
    }

    // TODO: Implementar subida a S3/MinIO
    // Por ahora simular almacenamiento
    const s3Key = `affiliations/${createDto.employeeId}/${createDto.tipo}_${Date.now()}.pdf`;
    const url = `https://storage.talentonet.com/${s3Key}`;
    const filename = file.originalname;

    return await this.affiliationsService.create(
      createDto,
      req.user.userId,
      s3Key,
      url,
      filename,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar afiliaciones con filtros' })
  @ApiQuery({ name: 'tipo', enum: AffiliationType, required: false })
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'proveedor', required: false })
  @ApiQuery({ name: 'period', required: false, description: 'Formato: YYYY-MM' })
  @ApiResponse({ status: 200, description: 'Lista de afiliaciones' })
  async findAll(@Query() filters: AffiliationFilterDto) {
    return await this.affiliationsService.findAll(filters);
  }

  @Get('report')
  @ApiOperation({ summary: 'Generar reporte de afiliaciones' })
  @ApiQuery({ name: 'period', required: false, description: 'Formato: YYYY-MM' })
  @ApiResponse({ status: 200, description: 'Reporte generado' })
  async generateReport(@Query('period') period?: string) {
    return await this.affiliationsService.generateReport(period);
  }

  @Get('providers')
  @ApiOperation({ summary: 'Obtener catálogo de proveedores' })
  @ApiQuery({ name: 'tipo', enum: AffiliationType, required: false })
  @ApiResponse({ status: 200, description: 'Lista de proveedores' })
  async getProviders(@Query('tipo') tipo?: AffiliationType) {
    return await this.affiliationsService.getProviders(tipo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener afiliación por ID' })
  @ApiResponse({ status: 200, description: 'Afiliación encontrada' })
  @ApiResponse({ status: 404, description: 'Afiliación no encontrada' })
  async findOne(@Param('id') id: string) {
    // TODO: Verificar permisos para descifrar número
    return await this.affiliationsService.findOne(id, false);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Obtener historial de cambios' })
  @ApiResponse({ status: 200, description: 'Historial de logs' })
  async getLogs(@Param('id') id: string) {
    return await this.affiliationsService.getLogs(id);
  }

  @Patch(':id/retire')
  @ApiOperation({ summary: 'Retirar afiliación' })
  @ApiResponse({ status: 200, description: 'Afiliación retirada' })
  @ApiResponse({ status: 400, description: 'Afiliación ya retirada' })
  @ApiResponse({ status: 404, description: 'Afiliación no encontrada' })
  async retire(
    @Param('id') id: string,
    @Body() retireDto: RetireAffiliationDto,
    @Request() req: any,
  ) {
    return await this.affiliationsService.retire(id, retireDto, req.user.userId);
  }

  @Patch(':id/document')
  @ApiOperation({ summary: 'Actualizar comprobante' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comprobante: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('comprobante'))
  async updateDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('El comprobante es obligatorio');
    }

    // TODO: Implementar subida a S3/MinIO
    const s3Key = `affiliations/updates/${id}_${Date.now()}.pdf`;
    const url = `https://storage.talentonet.com/${s3Key}`;
    const filename = file.originalname;

    return await this.affiliationsService.updateDocument(
      id,
      s3Key,
      url,
      filename,
      req.user.userId,
    );
  }
}
