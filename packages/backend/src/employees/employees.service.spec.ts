import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeesService } from './employees.service';
import { Employee, EmployeeStatus, IdentificationType, Gender } from './employee.entity';
import { Contract } from '../payroll/contract.entity';
import { UsersService } from '../users/users.service';
import { QueueService } from '../queue/queue.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let repository: Repository<Employee>;
  let contractRepository: Repository<Contract>;
  let usersService: UsersService;
  let queueService: QueueService;

  const mockEmployee: Employee = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '',
    identificationType: IdentificationType.CC,
    identificationNumber: '1234567890',
    firstName: 'Juan',
    lastName: 'García',
    dateOfBirth: new Date('1990-01-15'),
    gender: Gender.M,
    phone: '3001234567',
    address: '',
    city: 'Bogotá',
    department: 'Cundinamarca',
    country: 'Colombia',
    hireDate: new Date('2024-01-01'),
    terminationDate: undefined as any,
    status: EmployeeStatus.ACTIVE,
    user: undefined as any,
    contracts: [],
    affiliations: [],
    payrollEntries: [],
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    fullName: 'Juan García',
    age: 34,
  };

  const mockContract = {
    id: 'contract-id-123',
    employeeId: mockEmployee.id,
    contractType: 'indefinido',
    position: 'Desarrollador Senior',
    department: 'Tecnología',
    salary: 5000000,
    startDate: new Date('2024-01-01'),
    endDate: undefined,
    isCurrent: true,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
  };

  const mockContractRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUsersService = {
    createEmployeeUser: jest.fn(),
  };

  const mockQueueService = {
    publishToQueue: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Contract),
          useValue: mockContractRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: QueueService,
          useValue: mockQueueService,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    repository = module.get<Repository<Employee>>(getRepositoryToken(Employee));
    contractRepository = module.get<Repository<Contract>>(getRepositoryToken(Contract));
    usersService = module.get<UsersService>(UsersService);
    queueService = module.get<QueueService>(QueueService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      identificationType: IdentificationType.CC,
      identificationNumber: '1234567890',
      firstName: 'Juan',
      lastName: 'García',
      dateOfBirth: '1990-01-15',
      gender: Gender.M,
      phone: '3001234567',
      city: 'Bogotá',
      department: 'Cundinamarca',
      hireDate: '2024-01-01',
      contract: {
        contractType: 'indefinido',
        position: 'Desarrollador Senior',
        department: 'Tecnología',
        salary: 5000000,
        startDate: '2024-01-01',
      },
    };

    it('debe crear un empleado exitosamente', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockEmployee);
      mockRepository.save.mockResolvedValue(mockEmployee);
      mockContractRepository.create.mockReturnValue(mockContract);
      mockContractRepository.save.mockResolvedValue(mockContract);
      mockQueueService.publishToQueue.mockResolvedValue(undefined);

      const result = await service.create(createDto);

      expect(result).toEqual(mockEmployee);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { identificationNumber: createDto.identificationNumber },
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockContractRepository.create).toHaveBeenCalled();
      expect(mockContractRepository.save).toHaveBeenCalled();
      expect(mockQueueService.publishToQueue).toHaveBeenCalledWith(
        'notifications',
        expect.objectContaining({ type: 'employee.created' }),
      );
    });

    it('debe lanzar ConflictException si el empleado ya existe', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmployee);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('debe crear usuario si se proporciona email', async () => {
      const createDtoWithEmail = { ...createDto, email: 'juan.garcia@test.com' };
      const mockUser = { id: 'user-id-123', email: createDtoWithEmail.email };

      mockRepository.findOne.mockResolvedValue(null);
      mockUsersService.createEmployeeUser.mockResolvedValue(mockUser);
      mockRepository.create.mockReturnValue({ ...mockEmployee, userId: mockUser.id });
      mockRepository.save.mockResolvedValue({ ...mockEmployee, userId: mockUser.id });
      mockQueueService.publishToQueue.mockResolvedValue(undefined);

      const result = await service.create(createDtoWithEmail);

      expect(mockUsersService.createEmployeeUser).toHaveBeenCalledWith(createDtoWithEmail.email);
      expect(result.userId).toBe(mockUser.id);
    });
  });

  describe('findOne', () => {
    it('debe retornar un empleado por ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmployee);

      const result = await service.findOne(mockEmployee.id);

      expect(result).toEqual(mockEmployee);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockEmployee.id },
        relations: ['user', 'contracts', 'affiliations'],
      });
    });

    it('debe lanzar NotFoundException si no existe el empleado', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('debe retornar lista paginada de empleados', async () => {
      const employees = [mockEmployee];
      mockRepository.findAndCount.mockResolvedValue([employees, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: employees,
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('debe aplicar filtros correctamente', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        status: EmployeeStatus.ACTIVE,
        city: 'Bogotá',
        page: 1,
        limit: 10,
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: EmployeeStatus.ACTIVE,
            city: 'Bogotá',
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('debe actualizar un empleado exitosamente', async () => {
      const updateDto = { firstName: 'Juan Carlos' };
      const updatedEmployee = { ...mockEmployee, ...updateDto };

      mockRepository.findOne
        .mockResolvedValueOnce(mockEmployee) // findOne en update
        .mockResolvedValueOnce(null); // verificación de identificación
      mockRepository.save.mockResolvedValue(updatedEmployee);
      mockQueueService.publishToQueue.mockResolvedValue(undefined);

      const result = await service.update(mockEmployee.id, updateDto);

      expect(result.firstName).toBe(updateDto.firstName);
      expect(mockQueueService.publishToQueue).toHaveBeenCalledWith(
        'notifications',
        expect.objectContaining({ type: 'employee.updated' }),
      );
    });
  });

  describe('remove', () => {
    it('debe desactivar un empleado (soft delete)', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmployee);
      mockRepository.save.mockResolvedValue({
        ...mockEmployee,
        status: EmployeeStatus.INACTIVE,
      });
      mockQueueService.publishToQueue.mockResolvedValue(undefined);

      await service.remove(mockEmployee.id);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: EmployeeStatus.INACTIVE,
          terminationDate: expect.any(Date),
        }),
      );
      expect(mockQueueService.publishToQueue).toHaveBeenCalledWith(
        'notifications',
        expect.objectContaining({ type: 'employee.deactivated' }),
      );
    });
  });

  describe('getActiveCount', () => {
    it('debe retornar el conteo de empleados activos', async () => {
      mockRepository.count.mockResolvedValue(25);

      const result = await service.getActiveCount();

      expect(result).toBe(25);
      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { status: EmployeeStatus.ACTIVE },
      });
    });
  });
});
