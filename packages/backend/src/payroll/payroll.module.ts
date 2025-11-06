import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollController } from './payroll.controller';
import {
  PayrollConfig,
  PayrollPeriod,
  PayrollNovedad,
  PayrollEntry,
  Payslip,
  PayrollExportLog,
} from './entities';
import { Employee } from '../employees/employee.entity';
import { Contract } from './contract.entity';
import {
  PayrollConfigService,
  PayrollCalculationService,
  PayrollService,
} from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PayrollConfig,
      PayrollPeriod,
      PayrollNovedad,
      PayrollEntry,
      Payslip,
      PayrollExportLog,
      Employee,
      Contract,
    ]),
  ],
  controllers: [PayrollController],
  providers: [
    PayrollConfigService,
    PayrollCalculationService,
    PayrollService,
  ],
  exports: [
    PayrollConfigService,
    PayrollCalculationService,
    PayrollService,
  ],
})
export class PayrollModule {}
