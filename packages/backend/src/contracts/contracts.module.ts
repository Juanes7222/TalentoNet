import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractSettlementController } from './contract-settlement.controller';
import { ContractSettlement, ContractSettlementAudit } from './entities';
import { Employee } from '../employees/employee.entity';
import { Contract } from '../payroll/contract.entity';
import { PayrollEntry } from '../payroll/entities/payroll-entry.entity';
import {
  ContractSettlementService,
  ContractSettlementCalculationService,
} from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContractSettlement,
      ContractSettlementAudit,
      Employee,
      Contract,
      PayrollEntry,
    ]),
  ],
  controllers: [ContractSettlementController],
  providers: [ContractSettlementService, ContractSettlementCalculationService],
  exports: [ContractSettlementService, ContractSettlementCalculationService],
})
export class ContractsModule {}
