import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
  Vacancy,
  Candidate,
  Interview,
  CandidateStateHistory,
} from './entities';
import { Employee } from '../employees/employee.entity';

// Services
import {
  VacanciesService,
  CandidatesService,
  InterviewsService,
} from './services';

// Controllers
import {
  VacanciesController,
  CandidatesController,
  InterviewsController,
} from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vacancy,
      Candidate,
      Interview,
      CandidateStateHistory,
      Employee, // Agregado para crear empleados desde candidatos
    ]),
  ],
  controllers: [
    VacanciesController,
    CandidatesController,
    InterviewsController,
  ],
  providers: [
    VacanciesService,
    CandidatesService,
    InterviewsService,
  ],
  exports: [
    VacanciesService,
    CandidatesService,
    InterviewsService,
  ],
})
export class RecruitmentModule {}
