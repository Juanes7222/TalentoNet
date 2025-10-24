import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { EmployeeStatus, IdentificationType, Gender } from '../src/employees/employee.entity';

describe('EmployeesController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdEmployeeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    // Login para obtener token (asumiendo credenciales de seed)
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'rh@talentonet.com', password: 'Password123!' });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/employees', () => {
    it('debe crear un empleado exitosamente', async () => {
      const createDto = {
        identificationType: IdentificationType.CC,
        identificationNumber: '9999999999',
        firstName: 'Test',
        lastName: 'Employee',
        dateOfBirth: '1995-05-20',
        gender: Gender.M,
        phone: '3009876543',
        city: 'Bogotá',
        department: 'Cundinamarca',
        hireDate: '2024-10-01',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.identificationNumber).toBe(createDto.identificationNumber);
      expect(response.body.firstName).toBe(createDto.firstName);
      
      createdEmployeeId = response.body.id;
    });

    it('debe retornar 409 si el empleado ya existe', async () => {
      const createDto = {
        identificationType: IdentificationType.CC,
        identificationNumber: '9999999999', // mismo del test anterior
        firstName: 'Duplicate',
        lastName: 'Test',
        dateOfBirth: '1990-01-01',
        hireDate: '2024-10-01',
      };

      await request(app.getHttpServer())
        .post('/api/v1/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(409);
    });

    it('debe retornar 400 con datos inválidos', async () => {
      const invalidDto = {
        identificationType: 'INVALID',
        identificationNumber: '123',
        firstName: 'T',
        // Faltan campos requeridos
      };

      await request(app.getHttpServer())
        .post('/api/v1/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /api/v1/employees/:id', () => {
    it('debe retornar un empleado por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/employees/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdEmployeeId);
      expect(response.body).toHaveProperty('fullName');
      expect(response.body).toHaveProperty('age');
    });

    it('debe retornar 404 si no existe el empleado', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      await request(app.getHttpServer())
        .get(`/api/v1/employees/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/v1/employees', () => {
    it('debe retornar lista paginada de empleados', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/employees?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 10);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debe filtrar por estado', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/employees?status=${EmployeeStatus.ACTIVE}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.every((emp: any) => emp.status === EmployeeStatus.ACTIVE)).toBe(true);
    });
  });

  describe('PATCH /api/v1/employees/:id', () => {
    it('debe actualizar un empleado', async () => {
      const updateDto = {
        phone: '3001111111',
        address: 'Nueva dirección 123',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/employees/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.phone).toBe(updateDto.phone);
      expect(response.body.address).toBe(updateDto.address);
    });
  });

  describe('DELETE /api/v1/employees/:id', () => {
    it('debe desactivar un empleado', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/employees/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verificar que el empleado está inactivo
      const response = await request(app.getHttpServer())
        .get(`/api/v1/employees/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe(EmployeeStatus.INACTIVE);
      expect(response.body.terminationDate).toBeTruthy();
    });
  });
});
