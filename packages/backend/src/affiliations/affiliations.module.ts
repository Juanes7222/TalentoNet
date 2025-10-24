import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Affiliation, AffiliationLog, AffiliationProvider } from './entities';
import { AffiliationsService } from './services';
import { AffiliationsController, EmployeeAffiliationsController } from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([Affiliation, AffiliationLog, AffiliationProvider]),
    ConfigModule,
  ],
  controllers: [AffiliationsController, EmployeeAffiliationsController],
  providers: [AffiliationsService],
  exports: [AffiliationsService],
})
export class AffiliationsModule {}
