import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './services/payroll.service';
import {
  CreatePayrollPeriodDto,
  CreateNovedadDto,
  BulkCreateNovedadesDto,
  LiquidatePayrollDto,
  ApprovePayrollDto,
  ClosePayrollDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  // ========== PERÍODOS ==========

  @Post('periods')
  @ApiOperation({ summary: 'Crear nuevo período de nómina' })
  @ApiResponse({ status: 201, description: 'Período creado exitosamente' })
  async createPeriod(@Body() dto: CreatePayrollPeriodDto, @Request() req: RequestWithUser) {
    return await this.payrollService.createPeriod(dto, req.user.userId);
  }

  @Get('periods')
  @ApiOperation({ summary: 'Listar todos los períodos' })
  async findAllPeriods() {
    return await this.payrollService.findAllPeriods();
  }

  @Get('periods/:id')
  @ApiOperation({ summary: 'Obtener período específico' })
  async findOnePeriod(@Param('id', ParseIntPipe) id: number) {
    return await this.payrollService.findOnePeriod(id);
  }

  // ========== NOVEDADES ==========

  @Post('periods/:id/novedades')
  @ApiOperation({ summary: 'Agregar novedad a un período' })
  @ApiResponse({ status: 201, description: 'Novedad agregada' })
  async createNovedad(
    @Param('id', ParseIntPipe) periodId: number,
    @Body() dto: CreateNovedadDto,
    @Request() req: RequestWithUser,
  ) {
    return await this.payrollService.createNovedad(periodId, dto, req.user.userId);
  }

  @Post('periods/:id/novedades/bulk')
  @ApiOperation({ summary: 'Carga masiva de novedades' })
  @ApiResponse({ status: 201, description: 'Novedades cargadas' })
  async bulkCreateNovedades(
    @Param('id', ParseIntPipe) periodId: number,
    @Body() dto: BulkCreateNovedadesDto,
    @Request() req: RequestWithUser,
  ) {
    return await this.payrollService.bulkCreateNovedades(periodId, dto, req.user.userId);
  }

  @Get('periods/:id/novedades')
  @ApiOperation({ summary: 'Listar novedades de un período' })
  async findNovedades(@Param('id', ParseIntPipe) periodId: number) {
    return await this.payrollService.findNovedadesByPeriod(periodId);
  }

  // ========== LIQUIDACIÓN ==========

  @Post('periods/:id/liquidate')
  @ApiOperation({ summary: 'Liquidar período (ejecutar cálculo de nómina)' })
  @ApiResponse({ status: 200, description: 'Período liquidado' })
  async liquidatePeriod(
    @Param('id', ParseIntPipe) periodId: number,
    @Body() dto: LiquidatePayrollDto,
    @Request() req: RequestWithUser,
  ) {
    return await this.payrollService.liquidatePeriod(periodId, dto, req.user.userId);
  }

  @Get('periods/:id/entries')
  @ApiOperation({ summary: 'Listar liquidaciones de un período' })
  async findEntries(@Param('id', ParseIntPipe) periodId: number) {
    return await this.payrollService.findEntriesByPeriod(periodId);
  }

  @Get('periods/:periodId/entries/:employeeId')
  @ApiOperation({ summary: 'Obtener liquidación de un empleado' })
  async findEntryByEmployee(
    @Param('periodId', ParseIntPipe) periodId: number,
    @Param('employeeId') employeeId: string,
  ) {
    return await this.payrollService.findEntryByEmployeeAndPeriod(periodId, employeeId);
  }

  // ========== APROBACIÓN Y CIERRE ==========

  @Post('periods/:id/approve')
  @ApiOperation({ summary: 'Aprobar período (Gerencia)' })
  async approvePeriod(
    @Param('id', ParseIntPipe) periodId: number,
    @Body() dto: ApprovePayrollDto,
    @Request() req: RequestWithUser,
  ) {
    return await this.payrollService.approvePeriod(periodId, dto, req.user.userId);
  }

  @Post('periods/:id/close')
  @ApiOperation({ summary: 'Cerrar período (Contabilidad)' })
  async closePeriod(
    @Param('id', ParseIntPipe) periodId: number,
    @Body() dto: ClosePayrollDto,
    @Request() req: RequestWithUser,
  ) {
    return await this.payrollService.closePeriod(periodId, dto, req.user.userId);
  }
}
