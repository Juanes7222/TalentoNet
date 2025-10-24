import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AffiliationsService } from '../services/affiliations.service';

@ApiTags('Empleados - Afiliaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employees/:employeeId/affiliations')
export class EmployeeAffiliationsController {
  constructor(private readonly affiliationsService: AffiliationsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener afiliaciones de un empleado' })
  @ApiResponse({ status: 200, description: 'Lista de afiliaciones del empleado' })
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return await this.affiliationsService.findByEmployee(employeeId);
  }
}
