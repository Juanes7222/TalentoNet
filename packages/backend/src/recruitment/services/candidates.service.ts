import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate, CandidateStatus } from '../entities/candidate.entity';
import { CandidateStateHistory } from '../entities/candidate-state-history.entity';
import { Employee, IdentificationType } from '../../employees/employee.entity';
import { Contract } from '../../payroll/contract.entity';
import { CreateCandidateDto } from '../dto/create-candidate.dto';
import { UpdateCandidateStatusDto } from '../dto/update-candidate-status.dto';
import { CandidateFilterDto } from '../dto/candidate-filter.dto';

@Injectable()
export class CandidatesService {
  private readonly logger = new Logger(CandidatesService.name);

  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(CandidateStateHistory)
    private readonly stateHistoryRepository: Repository<CandidateStateHistory>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
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

    // Si el nuevo estado es CONTRATADO, crear automáticamente un empleado
    if (updateStatusDto.estado === CandidateStatus.CONTRATADO) {
      await this.createEmployeeFromCandidate(candidate);
    }

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

  /**
   * Crea un empleado y su contrato a partir de un candidato contratado
   */
  private async createEmployeeFromCandidate(candidate: Candidate): Promise<Employee> {
    // Cargar la vacante para obtener información del contrato
    const candidateWithVacancy = await this.candidateRepository.findOne({
      where: { id: candidate.id },
      relations: ['vacancy'],
    });

    if (!candidateWithVacancy?.vacancy) {
      throw new BadRequestException(
        'No se puede contratar: No se encontró información de la vacante',
      );
    }

    const vacancy = candidateWithVacancy.vacancy;

    // Verificar si ya existe un empleado con esta cédula
    let employee = await this.employeeRepository.findOne({
      where: { identificationNumber: candidate.cedula },
    });

    if (employee) {
      this.logger.log(`Empleado con cédula ${candidate.cedula} ya existe. ID: ${employee.id}`);
    } else {
      // Crear el empleado con la información del candidato
      employee = this.employeeRepository.create({
        identificationType: IdentificationType.CC, // Por defecto CC, se puede ajustar
        identificationNumber: candidate.cedula,
        firstName: candidate.nombre,
        lastName: candidate.apellido,
        dateOfBirth: candidate.fechaNacimiento
          ? new Date(candidate.fechaNacimiento)
          : new Date('1990-01-01'), // Fecha placeholder si no existe
        phone: candidate.telefono,
        address: candidate.direccion,
        city: candidate.ciudad,
        department: candidate.departamento,
        hireDate: new Date(), // Fecha actual como fecha de contratación
        country: 'Colombia',
      });

      employee = await this.employeeRepository.save(employee);
      this.logger.log(`Empleado creado exitosamente. ID: ${employee.id}`);
    }

    // Verificar si ya tiene un contrato activo
    const existingContract = await this.contractRepository.findOne({
      where: { employeeId: employee.id, isCurrent: true },
    });

    if (existingContract) {
      this.logger.warn(
        `El empleado ${employee.id} ya tiene un contrato activo. No se creará uno nuevo.`,
      );
      return employee;
    }

    // Crear el contrato basado en la información de la vacante
    // Si la vacante tiene rango salarial, usar el promedio o el mínimo
    const salarioContrato = vacancy.salarioMin || 1300000; // Salario mínimo por defecto

    const contract = this.contractRepository.create({
      employeeId: employee.id,
      contractType: 'indefinido', // Por defecto indefinido, puede ajustarse manualmente después
      position: vacancy.cargo,
      department: vacancy.departamento,
      salary: salarioContrato,
      startDate: new Date(), // Fecha actual como inicio del contrato
      isCurrent: true,
    });

    await this.contractRepository.save(contract);
    this.logger.log(
      `Contrato creado exitosamente para empleado ${employee.id}. Cargo: ${vacancy.cargo}, Salario: ${salarioContrato}`,
    );

    return employee;
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
