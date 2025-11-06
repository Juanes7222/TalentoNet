import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  Affiliation,
  AffiliationType,
  AffiliationStatus,
  IntegrationStatus,
} from '../entities/affiliation.entity';
import { AffiliationLog, AffiliationLogAction } from '../entities/affiliation-log.entity';
import { AffiliationProvider } from '../entities/affiliation-provider.entity';
import { CreateAffiliationDto } from '../dto/create-affiliation.dto';
import { RetireAffiliationDto, UpdateAffiliationDto } from '../dto/update-affiliation.dto';
import { AffiliationFilterDto } from '../dto/affiliation-filter.dto';

@Injectable()
export class AffiliationsService {
  private readonly encryptionKey: string;
  private readonly algorithm = 'aes-256-cbc';

  constructor(
    @InjectRepository(Affiliation)
    private readonly affiliationRepository: Repository<Affiliation>,
    @InjectRepository(AffiliationLog)
    private readonly logRepository: Repository<AffiliationLog>,
    @InjectRepository(AffiliationProvider)
    private readonly providerRepository: Repository<AffiliationProvider>,
    private readonly configService: ConfigService,
  ) {
    this.encryptionKey = this.configService.get<string>('ENCRYPTION_KEY') || 'TalentoNetSecretKey2025';
  }

  /**
   * Cifrar número de afiliación
   */
  private encryptNumber(text: string): Buffer {
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return Buffer.concat([iv, encrypted]);
  }

  /**
   * Descifrar número de afiliación
   */
  private decryptNumber(buffer: Buffer): string {
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const iv = buffer.slice(0, 16);
    const encrypted = buffer.slice(16);
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }

  /**
   * Crear nueva afiliación
   */
  async create(
    createDto: CreateAffiliationDto,
    userId: string,
    comprobanteS3Key?: string,
    comprobanteUrl?: string,
    comprobanteFilename?: string,
  ): Promise<Affiliation> {
    // Verificar si ya existe una afiliación activa del mismo tipo
    const existingActive = await this.affiliationRepository.findOne({
      where: {
        employeeId: createDto.employeeId,
        tipo: createDto.tipo,
        estado: AffiliationStatus.ACTIVO,
      },
    });

    if (existingActive) {
      throw new ConflictException(
        `Ya existe una afiliación activa de tipo ${createDto.tipo} para este empleado. Debe retirar la existente primero.`,
      );
    }

    // Validar consentimiento ARCO
    if (!createDto.consentimientoArco) {
      throw new BadRequestException(
        'Se requiere consentimiento ARCO del empleado para crear la afiliación',
      );
    }

    // Validar comprobante
    if (!comprobanteS3Key) {
      throw new BadRequestException(
        'El comprobante de afiliación es obligatorio para auditoría',
      );
    }

    // Cifrar número de afiliación
    const numeroEncrypted = this.encryptNumber(createDto.numeroAfiliacion);

    // Crear afiliación
    const affiliation = this.affiliationRepository.create({
      employeeId: createDto.employeeId,
      tipo: createDto.tipo,
      proveedor: createDto.proveedor,
      codigoProveedor: createDto.codigoProveedor,
      numeroAfiliacionEncrypted: numeroEncrypted,
      fechaAfiliacion: new Date(createDto.fechaAfiliacion),
      estado: AffiliationStatus.ACTIVO,
      comprobanteS3Key,
      comprobanteUrl,
      comprobanteFilename,
      consentimientoArco: createDto.consentimientoArco,
      fechaConsentimiento: new Date(),
      integrationStatus: IntegrationStatus.MANUAL,
      createdBy: userId,
    });

    const saved = await this.affiliationRepository.save(affiliation);

    // El log se crea automáticamente por el trigger, pero podemos agregar metadata adicional
    await this.createLog({
      affiliationId: saved.id,
      accion: AffiliationLogAction.CREACION,
      detalle: `Afiliación ${createDto.tipo} creada para proveedor ${createDto.proveedor}`,
      usuarioId: userId,
      metadata: {
        tipo: createDto.tipo,
        proveedor: createDto.proveedor,
        consentimiento_arco: createDto.consentimientoArco,
      },
    });

    return saved;
  }

  /**
   * Obtener afiliaciones de un empleado
   */
  async findByEmployee(employeeId: string): Promise<Affiliation[]> {
    return await this.affiliationRepository.find({
      where: { employeeId },
      relations: ['createdByUser', 'retiredByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener una afiliación por ID
   * Nota: La relación 'logs' está comentada en la entidad Affiliation.
   * Los logs se obtienen a través del método getLogs() usando el repositorio de logs.
   */
  async findOne(id: string, includeDecryptedNumber = false): Promise<Affiliation> {
    const affiliation = await this.affiliationRepository.findOne({
      where: { id },
      relations: ['employee', 'createdByUser', 'retiredByUser'],
    });

    if (!affiliation) {
      throw new NotFoundException(`Afiliación con ID ${id} no encontrada`);
    }

    // Si se solicita, descifrar el número (solo para usuarios autorizados)
    if (includeDecryptedNumber && affiliation.numeroAfiliacionEncrypted) {
      const decrypted = this.decryptNumber(affiliation.numeroAfiliacionEncrypted);
      // Agregar como propiedad temporal (no se persiste)
      (affiliation as any).numeroAfiliacionDecrypted = decrypted;
    }

    return affiliation;
  }

  /**
   * Listar afiliaciones con filtros
   */
  async findAll(filters?: AffiliationFilterDto): Promise<Affiliation[]> {
    const query = this.affiliationRepository
      .createQueryBuilder('affiliation')
      .leftJoinAndSelect('affiliation.employee', 'employee')
      .leftJoinAndSelect('affiliation.createdByUser', 'createdByUser');

    if (filters?.tipo) {
      query.andWhere('affiliation.tipo = :tipo', { tipo: filters.tipo });
    }

    if (filters?.estado) {
      query.andWhere('affiliation.estado = :estado', { estado: filters.estado });
    }

    if (filters?.proveedor) {
      query.andWhere('affiliation.proveedor ILIKE :proveedor', {
        proveedor: `%${filters.proveedor}%`,
      });
    }

    if (filters?.period) {
      // Formato: YYYY-MM
      const [year, month] = filters.period.split('-');
      query.andWhere(
        "DATE_TRUNC('month', affiliation.fecha_afiliacion) = :period",
        { period: `${year}-${month}-01` },
      );
    }

    return await query.orderBy('affiliation.created_at', 'DESC').getMany();
  }

  /**
   * Retirar afiliación
   */
  async retire(
    id: string,
    retireDto: RetireAffiliationDto,
    userId: string,
  ): Promise<Affiliation> {
    const affiliation = await this.findOne(id);

    if (affiliation.estado === AffiliationStatus.RETIRADO) {
      throw new BadRequestException('La afiliación ya está retirada');
    }

    affiliation.estado = AffiliationStatus.RETIRADO;
    affiliation.fechaRetiro = retireDto.fechaRetiro
      ? new Date(retireDto.fechaRetiro)
      : new Date();
    affiliation.retiredBy = userId;
    affiliation.retiredAt = new Date();

    const updated = await this.affiliationRepository.save(affiliation);

    // Registrar en el log (el trigger también lo hace, pero agregamos detalle)
    await this.createLog({
      affiliationId: id,
      accion: AffiliationLogAction.RETIRO,
      detalle: retireDto.comentario || `Afiliación ${affiliation.tipo} retirada`,
      usuarioId: userId,
      metadata: {
        fecha_retiro: affiliation.fechaRetiro,
        comentario: retireDto.comentario,
      },
    });

    return updated;
  }

  /**
   * Actualizar comprobante
   */
  async updateDocument(
    id: string,
    s3Key: string,
    url: string,
    filename: string,
    userId: string,
  ): Promise<Affiliation> {
    const affiliation = await this.findOne(id);

    affiliation.comprobanteS3Key = s3Key;
    affiliation.comprobanteUrl = url;
    affiliation.comprobanteFilename = filename;

    const updated = await this.affiliationRepository.save(affiliation);

    await this.createLog({
      affiliationId: id,
      accion: AffiliationLogAction.DOCUMENTO_ACTUALIZADO,
      detalle: `Comprobante actualizado: ${filename}`,
      usuarioId: userId,
    });

    return updated;
  }

  /**
   * Obtener historial de logs
   */
  async getLogs(affiliationId: string): Promise<AffiliationLog[]> {
    await this.findOne(affiliationId); // Verificar que existe

    return await this.logRepository.find({
      where: { affiliationId },
      relations: ['usuario'],
      order: { fecha: 'DESC' },
    });
  }

  /**
   * Crear log manual
   */
  private async createLog(data: {
    affiliationId: string;
    accion: AffiliationLogAction;
    detalle?: string;
    usuarioId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AffiliationLog> {
    const log = this.logRepository.create(data);
    return await this.logRepository.save(log);
  }

  /**
   * Obtener proveedores
   */
  async getProviders(tipo?: AffiliationType): Promise<AffiliationProvider[]> {
    const where: any = { activo: true };
    if (tipo) {
      where.tipo = tipo;
    }

    return await this.providerRepository.find({
      where,
      order: { nombre: 'ASC' },
    });
  }

  /**
   * Generar reporte de afiliaciones
   */
  async generateReport(period?: string): Promise<any> {
    const query = this.affiliationRepository
      .createQueryBuilder('a')
      .select('a.tipo', 'tipo')
      .addSelect('a.proveedor', 'proveedor')
      .addSelect('a.estado', 'estado')
      .addSelect('COUNT(*)', 'total')
      .groupBy('a.tipo')
      .addGroupBy('a.proveedor')
      .addGroupBy('a.estado');

    if (period) {
      const [year, month] = period.split('-');
      query.where("DATE_TRUNC('month', a.fecha_afiliacion) = :period", {
        period: `${year}-${month}-01`,
      });
    }

    const results = await query.getRawMany();

    // Convertir totales de string a number
    const dataWithNumbers = results.map((r) => ({
      ...r,
      total: parseInt(r.total, 10),
    }));

    return {
      period: period || 'all',
      generatedAt: new Date(),
      data: dataWithNumbers,
      summary: {
        totalActivas: dataWithNumbers
          .filter((r) => r.estado === 'activo')
          .reduce((sum, r) => sum + r.total, 0),
        totalRetiradas: dataWithNumbers
          .filter((r) => r.estado === 'retirado')
          .reduce((sum, r) => sum + r.total, 0),
      },
    };
  }
}
