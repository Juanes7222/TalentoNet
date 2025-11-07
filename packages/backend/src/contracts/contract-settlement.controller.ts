import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContractSettlementService } from './services/contract-settlement.service';
import {
  CreateSettlementDto,
  UpdateSettlementDto,
  ApproveSettlementDto,
  RejectSettlementDto,
  MarkAsPaidDto,
} from './dto/settlement.dto';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@ApiTags('Contract Settlements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractSettlementController {
  constructor(private readonly settlementService: ContractSettlementService) {}

  // ========== GENERAR LIQUIDACIÓN ==========

  @Post(':id/settle')
  @ApiOperation({ summary: 'Generar liquidación para un contrato' })
  @ApiResponse({ status: 201, description: 'Liquidación creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Ya existe liquidación para este contrato' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  async createSettlement(
    @Param('id') contractId: string,
    @Body() dto: CreateSettlementDto,
    @Request() req: RequestWithUser,
  ) {
    return await this.settlementService.generateSettlement(contractId, dto, req.user.userId);
  }

  // ========== LISTAR LIQUIDACIONES ==========

  @Get('settlements')
  @ApiOperation({ summary: 'Listar todas las liquidaciones' })
  async findAllSettlements() {
    return await this.settlementService.findAll();
  }

  @Get('settlements/:id')
  @ApiOperation({ summary: 'Obtener liquidación por ID' })
  @ApiResponse({ status: 404, description: 'Liquidación no encontrada' })
  async findSettlement(@Param('id') id: string) {
    return await this.settlementService.findOne(id);
  }

  @Get('employees/:employeeId/settlements')
  @ApiOperation({ summary: 'Listar liquidaciones de un empleado' })
  async findSettlementsByEmployee(@Param('employeeId') employeeId: string) {
    return await this.settlementService.findByEmployee(employeeId);
  }

  @Get(':contractId/settlement')
  @ApiOperation({ summary: 'Obtener liquidación de un contrato específico' })
  async findSettlementByContract(@Param('contractId') contractId: string) {
    return await this.settlementService.findByContract(contractId);
  }

  // ========== ACTUALIZAR LIQUIDACIÓN ==========

  @Patch('settlements/:id')
  @ApiOperation({ summary: 'Actualizar valores de liquidación (ajustes manuales)' })
  @ApiResponse({ status: 200, description: 'Liquidación actualizada' })
  @ApiResponse({ status: 400, description: 'No se puede editar en estado actual' })
  async updateSettlement(
    @Param('id') id: string,
    @Body() dto: UpdateSettlementDto,
    @Request() req: RequestWithUser,
  ) {
    return await this.settlementService.updateSettlement(id, dto, req.user.userId);
  }

  // ========== APROBAR LIQUIDACIÓN ==========

  @Patch('settlements/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprobar liquidación (Contadora)' })
  @ApiResponse({ status: 200, description: 'Liquidación aprobada' })
  @ApiResponse({ status: 400, description: 'La liquidación ya está aprobada o pagada' })
  async approveSettlement(
    @Param('id') id: string,
    @Body() dto: ApproveSettlementDto,
    @Request() req: RequestWithUser,
  ) {
    return await this.settlementService.approveSettlement(id, dto, req.user.userId);
  }

  // ========== RECHAZAR LIQUIDACIÓN ==========

  @Patch('settlements/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rechazar liquidación' })
  @ApiResponse({ status: 200, description: 'Liquidación rechazada' })
  async rejectSettlement(
    @Param('id') id: string,
    @Body() dto: RejectSettlementDto,
    @Request() req: RequestWithUser,
  ) {
    return await this.settlementService.rejectSettlement(id, dto, req.user.userId);
  }

  // ========== MARCAR COMO PAGADA ==========

  @Patch('settlements/:id/paid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar liquidación como pagada' })
  @ApiResponse({ status: 200, description: 'Liquidación marcada como pagada' })
  @ApiResponse({ status: 400, description: 'Solo liquidaciones aprobadas pueden marcarse como pagadas' })
  async markAsPaid(
    @Param('id') id: string,
    @Body() dto: MarkAsPaidDto,
    @Request() req: RequestWithUser,
  ) {
    return await this.settlementService.markAsPaid(id, dto, req.user.userId);
  }

  // ========== DESCARGAR PDF ==========

  @Get('settlements/:id/download')
  @ApiOperation({ summary: 'Descargar PDF de liquidación' })
  @ApiResponse({ status: 200, description: 'Descarga del PDF' })
  @ApiResponse({ status: 404, description: 'PDF no disponible' })
  async downloadPdf(@Param('id') id: string) {
    // TODO: Implementar generación y descarga de PDF
    const settlement = await this.settlementService.findOne(id);
    
    if (!settlement.pdfUrl) {
      return {
        message: 'PDF no disponible aún. Funcionalidad en desarrollo.',
        settlement,
      };
    }

    // Por ahora retornamos la URL, en producción redirigiríamos o streameríamos el archivo
    return {
      url: settlement.pdfUrl,
      s3Key: settlement.pdfS3Key,
    };
  }
}
