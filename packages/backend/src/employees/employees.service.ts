import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike, Or } from 'typeorm';
import { Employee, EmployeeStatus } from './employee.entity';
import { Contract } from '../payroll/contract.entity';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeFilterDto } from './dto/employee.dto';
import { UsersService } from '../users/users.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    private usersService: UsersService,
    private queueService: QueueService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // Verificar que no exista empleado con mismo número de identificación
    const existing = await this.employeesRepository.findOne({
      where: { identificationNumber: createEmployeeDto.identificationNumber },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un empleado con identificación ${createEmployeeDto.identificationNumber}`,
      );
    }

    // Validar que se proporcione información del contrato
    if (!createEmployeeDto.contract) {
      throw new BadRequestException('Se requiere información del contrato para crear el empleado');
    }

    // Si se proporciona email, crear usuario asociado
    let user = null;
    if (createEmployeeDto.email) {
      try {
        user = await this.usersService.createEmployeeUser(createEmployeeDto.email);
      } catch (error) {
        // Si es un ConflictException, re-lanzarlo directamente
        if (error instanceof ConflictException) {
          throw error;
        }
        // Para otros errores, envolver el mensaje
        throw new ConflictException(`Error creando usuario: ${error.message}`);
      }
    }

    // Extraer datos del contrato del DTO
    const { contract: contractData, ...employeeData } = createEmployeeDto;

    // Crear empleado
    const employee = this.employeesRepository.create({
      ...employeeData,
      userId: user?.id,
    });

    try {
      const savedEmployee = await this.employeesRepository.save(employee);
      this.logger.log(`Empleado creado exitosamente. ID: ${savedEmployee.id}`);

      // Crear el contrato automáticamente
      const contract = this.contractRepository.create({
        employeeId: savedEmployee.id,
        contractType: contractData.contractType,
        position: contractData.position,
        department: contractData.department,
        salary: contractData.salary,
        startDate: new Date(contractData.startDate),
        endDate: contractData.endDate ? new Date(contractData.endDate) : undefined,
        isCurrent: true,
      });

      await this.contractRepository.save(contract);
      this.logger.log(
        `Contrato creado exitosamente para empleado ${savedEmployee.id}. Cargo: ${contractData.position}, Salario: ${contractData.salary}`,
      );

      // Enviar evento a cola para notificaciones
      await this.queueService.publishToQueue('notifications', {
        type: 'employee.created',
        employeeId: savedEmployee.id,
        timestamp: new Date().toISOString(),
      });

      return savedEmployee;
    } catch (error) {
      this.logger.error(`Error creando empleado: ${error.message}`);
      
      // Manejar errores específicos de constraints
      if (error.message.includes('age_check')) {
        throw new BadRequestException('El empleado debe tener al menos 18 años de edad');
      }
      if (error.message.includes('salary_positive')) {
        throw new BadRequestException('El salario debe ser un valor positivo');
      }
      if (error.message.includes('dates_valid')) {
        throw new BadRequestException('La fecha de fin del contrato debe ser posterior a la fecha de inicio');
      }
      if (error.message.includes('unique constraint')) {
        throw new ConflictException('Ya existe un empleado con ese número de identificación');
      }
      
      throw new InternalServerErrorException('Error creando empleado y contrato');
    }
  }

  async findAll(filters: EmployeeFilterDto): Promise<{ data: Employee[]; total: number; page: number; limit: number }> {
    const { search, status, city, department, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    // Construir query builder para búsqueda más flexible
    const queryBuilder = this.employeesRepository.createQueryBuilder('employee')
      .leftJoinAndSelect('employee.user', 'user');

    // Si hay búsqueda, buscar en múltiples campos
    if (search) {
      queryBuilder.andWhere(
        '(employee.firstName ILIKE :search OR employee.lastName ILIKE :search OR employee.identificationNumber ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('employee.status = :status', { status });
    }

    if (city) {
      queryBuilder.andWhere('employee.city = :city', { city });
    }

    if (department) {
      queryBuilder.andWhere('employee.department = :department', { department });
    }

    // Paginación y ordenamiento
    queryBuilder
      .orderBy('employee.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: ['user', 'contracts', 'affiliations'],
    });

    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);

    // Si cambia número de identificación, verificar que no exista otro
    if (updateEmployeeDto.identificationNumber && updateEmployeeDto.identificationNumber !== employee.identificationNumber) {
      const existing = await this.employeesRepository.findOne({
        where: { identificationNumber: updateEmployeeDto.identificationNumber },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe un empleado con identificación ${updateEmployeeDto.identificationNumber}`,
        );
      }
    }

    Object.assign(employee, updateEmployeeDto);

    const updated = await this.employeesRepository.save(employee);

    // Evento a cola
    await this.queueService.publishToQueue('notifications', {
      type: 'employee.updated',
      employeeId: updated.id,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);

    // Soft delete: cambiar estado a inactivo
    employee.status = EmployeeStatus.INACTIVE;
    employee.terminationDate = new Date();

    await this.employeesRepository.save(employee);

    // Evento a cola
    await this.queueService.publishToQueue('notifications', {
      type: 'employee.deactivated',
      employeeId: id,
      timestamp: new Date().toISOString(),
    });
  }

  async findByIdentification(identificationNumber: string): Promise<Employee | null> {
    return this.employeesRepository.findOne({
      where: { identificationNumber },
    });
  }

  async getActiveCount(): Promise<number> {
    return this.employeesRepository.count({
      where: { status: EmployeeStatus.ACTIVE },
    });
  }
}
