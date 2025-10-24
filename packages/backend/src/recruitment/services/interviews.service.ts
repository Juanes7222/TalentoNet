import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from '../entities/interview.entity';
import { Candidate } from '../entities/candidate.entity';
import { CreateInterviewDto } from '../dto/create-interview.dto';
import { UpdateInterviewDto } from '../dto/update-interview.dto';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  async create(
    createInterviewDto: CreateInterviewDto,
    userId: string,
  ): Promise<Interview> {
    // Verificar que el candidato existe
    const candidate = await this.candidateRepository.findOne({
      where: { id: createInterviewDto.candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(
        `Candidato con ID ${createInterviewDto.candidateId} no encontrado`,
      );
    }

    const interview = this.interviewRepository.create({
      ...createInterviewDto,
      entrevistadorId: userId,
    });

    return await this.interviewRepository.save(interview);
  }

  async findAll(): Promise<Interview[]> {
    return await this.interviewRepository.find({
      relations: ['candidate', 'entrevistador'],
      order: { fecha: 'DESC' },
    });
  }

  async findByCandidate(candidateId: string): Promise<Interview[]> {
    return await this.interviewRepository.find({
      where: { candidateId },
      relations: ['candidate', 'entrevistador'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Interview> {
    const interview = await this.interviewRepository.findOne({
      where: { id },
      relations: ['candidate', 'entrevistador'],
    });

    if (!interview) {
      throw new NotFoundException(`Entrevista con ID ${id} no encontrada`);
    }

    return interview;
  }

  async update(id: string, updateInterviewDto: UpdateInterviewDto): Promise<Interview> {
    const interview = await this.findOne(id);

    Object.assign(interview, updateInterviewDto);

    return await this.interviewRepository.save(interview);
  }

  async remove(id: string): Promise<void> {
    const interview = await this.findOne(id);
    await this.interviewRepository.remove(interview);
  }
}
