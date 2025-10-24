import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate, CandidateStatus } from '../entities/candidate.entity';
import { CandidateStateHistory } from '../entities/candidate-state-history.entity';
import { CreateCandidateDto } from '../dto/create-candidate.dto';
import { UpdateCandidateStatusDto } from '../dto/update-candidate-status.dto';
import { CandidateFilterDto } from '../dto/candidate-filter.dto';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(CandidateStateHistory)
    private readonly stateHistoryRepository: Repository<CandidateStateHistory>,
  ) {}

  async create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    // Verificar si ya existe un candidato con la misma cédula para la misma vacante
    const existingCandidate = await this.candidateRepository.findOne({
      where: { 
        cedula: createCandidateDto.cedula,
        vacancyId: createCandidateDto.vacancyId,
      },
    });

    if (existingCandidate) {
      throw new ConflictException(
        `Ya existe un candidato con la cédula ${createCandidateDto.cedula} para esta vacante`,
      );
    }

    const candidate = this.candidateRepository.create(createCandidateDto);
    return await this.candidateRepository.save(candidate);
  }

  async findAll(filters?: CandidateFilterDto): Promise<Candidate[]> {
    const query = this.candidateRepository
      .createQueryBuilder('candidate')
      .leftJoinAndSelect('candidate.vacancy', 'vacancy')
      .leftJoinAndSelect('candidate.interviews', 'interviews');

    if (filters?.vacancyId) {
      query.andWhere('candidate.vacancyId = :vacancyId', { vacancyId: filters.vacancyId });
    }

    if (filters?.estado) {
      query.andWhere('candidate.estadoProceso = :estado', { estado: filters.estado });
    }

    if (filters?.search) {
      query.andWhere(
        '(candidate.nombre ILIKE :search OR candidate.apellido ILIKE :search OR candidate.cedula ILIKE :search OR candidate.email ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return await query.orderBy('candidate.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({
      where: { id },
      relations: ['vacancy', 'interviews', 'stateHistory', 'stateHistory.usuario'],
    });

    if (!candidate) {
      throw new NotFoundException(`Candidato con ID ${id} no encontrado`);
    }

    return candidate;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateCandidateStatusDto,
    userId?: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ): Promise<Candidate> {
    const candidate = await this.findOne(id);

    if (candidate.estadoProceso === updateStatusDto.estado) {
      throw new BadRequestException(
        `El candidato ya se encuentra en estado ${updateStatusDto.estado}`,
      );
    }

    const oldStatus = candidate.estadoProceso;
    candidate.estadoProceso = updateStatusDto.estado;

    // Guardar el cambio
    const updatedCandidate = await this.candidateRepository.save(candidate);

    // Registrar en el historial
    const stateHistory = this.stateHistoryRepository.create({
      candidateId: candidate.id,
      estadoAnterior: oldStatus,
      estadoNuevo: updateStatusDto.estado,
      usuarioId: userId || undefined, // Si no hay userId, quedará como null
      comentario: updateStatusDto.comentario,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    await this.stateHistoryRepository.save(stateHistory);

    return updatedCandidate;
  }

  async remove(id: string): Promise<void> {
    const candidate = await this.findOne(id);
    await this.candidateRepository.remove(candidate);
  }

  async getStateHistory(id: string): Promise<CandidateStateHistory[]> {
    await this.findOne(id); // Verificar que existe

    return await this.stateHistoryRepository.find({
      where: { candidateId: id },
      relations: ['usuario'],
      order: { fecha: 'DESC' },
    });
  }
}
