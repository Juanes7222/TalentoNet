import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CertificationRequest,
  CertificationStatus,
  RequesterType,
} from './entities/certification-request.entity';
import { Employee } from '../employees/employee.entity';
import { CreateCertificationDto, UpdateCertificationStatusDto } from './dto';
import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CertificationsService {
  constructor(
    @InjectRepository(CertificationRequest)
    private readonly certificationRepository: Repository<CertificationRequest>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createDto: CreateCertificationDto): Promise<CertificationRequest> {
    // Validar que el empleado existe
    const employee = await this.employeeRepository.findOne({
      where: { id: createDto.employeeId },
      relations: ['contracts'],
    });

    if (!employee) {
      throw new NotFoundException(`Empleado con ID ${createDto.employeeId} no encontrado`);
    }

    // Validar consentimiento si incluye salario
    if (createDto.incluirSalario && !createDto.consentimientoDatos) {
      throw new BadRequestException(
        'Se requiere consentimiento para incluir información salarial',
      );
    }

    const certification = this.certificationRepository.create(createDto);
    return await this.certificationRepository.save(certification);
  }

  async findAll(filters?: {
    employeeId?: string;
    estado?: CertificationStatus;
    requesterEmail?: string;
  }): Promise<CertificationRequest[]> {
    const query = this.certificationRepository
      .createQueryBuilder('cert')
      .leftJoinAndSelect('cert.employee', 'employee')
      .leftJoinAndSelect('cert.aprobadoPor', 'aprobador')
      .orderBy('cert.createdAt', 'DESC');

    if (filters?.employeeId) {
      query.andWhere('cert.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    if (filters?.estado) {
      query.andWhere('cert.estado = :estado', { estado: filters.estado });
    }

    if (filters?.requesterEmail) {
      query.andWhere('cert.requesterEmail = :email', { email: filters.requesterEmail });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<CertificationRequest> {
    const certification = await this.certificationRepository.findOne({
      where: { id },
      relations: ['employee', 'employee.contracts', 'aprobadoPor'],
    });

    if (!certification) {
      throw new NotFoundException(`Certificación con ID ${id} no encontrada`);
    }

    return certification;
  }

  async updateStatus(
    id: string,
    updateDto: UpdateCertificationStatusDto,
  ): Promise<CertificationRequest> {
    const certification = await this.findOne(id);

    if (updateDto.estado) {
      certification.estado = updateDto.estado;

      if (updateDto.estado === CertificationStatus.APROBADO && updateDto.aprobadoPorId) {
        certification.aprobadoPorId = updateDto.aprobadoPorId;
        certification.aprobadoEn = new Date();
      }

      if (updateDto.estado === CertificationStatus.RECHAZADO) {
        certification.rechazadoMotivo = updateDto.rechazadoMotivo || null;
      }
    }

    return await this.certificationRepository.save(certification);
  }

  async generatePdf(id: string): Promise<CertificationRequest> {
    const certification = await this.findOne(id);

    // Validar estado
    if (
      certification.estado !== CertificationStatus.APROBADO &&
      certification.estado !== CertificationStatus.PENDIENTE
    ) {
      throw new BadRequestException(
        `No se puede generar PDF en estado ${certification.estado}`,
      );
    }

    // Generar HTML
    const html = this.generateCertificationHtml(certification);

    // Generar PDF con puppeteer
    const pdfBuffer = await this.htmlToPdf(html);

    // Guardar PDF (simulado - en producción usar S3)
    const uploadsDir = path.join(process.cwd(), 'uploads', 'certifications');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `cert-${certification.id}-${Date.now()}.pdf`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, pdfBuffer);

    // Actualizar certificación
    certification.pdfUrl = `/uploads/certifications/${filename}`;
    certification.pdfS3Key = filename;
    certification.pdfGeneratedAt = new Date();
    certification.estado = CertificationStatus.GENERADO;

    return await this.certificationRepository.save(certification);
  }

  private generateCertificationHtml(certification: CertificationRequest): string {
    const employee = certification.employee;
    const contract = employee.contracts?.find((c) => c.isCurrent);

    // Calcular tiempo de servicio
    const hireDate = new Date(employee.hireDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hireDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 10px;
    }
    .doc-title {
      font-size: 20px;
      font-weight: bold;
      margin: 30px 0;
      text-align: center;
      text-decoration: underline;
    }
    .content {
      line-height: 1.8;
      text-align: justify;
      margin: 20px 0;
    }
    .signature-section {
      margin-top: 80px;
    }
    .signature-line {
      border-top: 1px solid #333;
      width: 300px;
      margin: 0 auto;
      padding-top: 10px;
      text-align: center;
    }
    .footer {
      margin-top: 40px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .info-box {
      background-color: #f3f4f6;
      padding: 15px;
      border-left: 4px solid #2563eb;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">TALENTONET S.A.S</div>
    <div>NIT: 900.123.456-7</div>
    <div>Bogotá D.C., Colombia</div>
  </div>

  <div class="doc-title">CERTIFICACIÓN LABORAL</div>

  <div class="content">
    <p>La suscrita Gerente de Recursos Humanos de <strong>TALENTONET S.A.S.</strong></p>
    
    <p style="text-align: center; font-size: 18px; font-weight: bold; margin: 30px 0;">
      CERTIFICA QUE:
    </p>

    <div class="info-box">
      <p><strong>Nombre:</strong> ${employee.firstName} ${employee.lastName}</p>
      <p><strong>Identificación:</strong> ${employee.identificationType} ${employee.identificationNumber}</p>
      ${certification.incluirCargo && contract ? `<p><strong>Cargo:</strong> ${contract.position}</p>` : ''}
      ${certification.incluirCargo && contract ? `<p><strong>Departamento:</strong> ${contract.department}</p>` : ''}
    </div>

    ${
      certification.incluirTiempoServicio
        ? `
    <p>
      Labora en nuestra empresa desde el <strong>${hireDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>,
      con un tiempo de servicio de <strong>${years} año(s) y ${months} mes(es)</strong>.
    </p>
    `
        : ''
    }

    ${
      certification.incluirSalario && contract
        ? `
    <p>
      Su salario básico mensual es de <strong>$${contract.salary.toLocaleString('es-CO')}</strong>.
    </p>
    `
        : ''
    }

    <p>
      El empleado se encuentra actualmente <strong>${employee.status === 'active' ? 'ACTIVO' : employee.status.toUpperCase()}</strong> 
      en nuestra organización.
    </p>

    <p>
      Se expide la presente certificación a solicitud del interesado para ${certification.motivo.toLowerCase()}.
    </p>
  </div>

  <div class="footer">
    <p>Generado el: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
    <p>Código de verificación: ${certification.id.substring(0, 8).toUpperCase()}</p>
  </div>

  <div class="signature-section">
    <div class="signature-line">
      <div>Gerente de Recursos Humanos</div>
      <div>TALENTONET S.A.S</div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private async htmlToPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  async getPdfPath(id: string): Promise<string> {
    const certification = await this.findOne(id);

    if (!certification.pdfUrl) {
      throw new NotFoundException('PDF no generado para esta certificación');
    }

    const filepath = path.join(process.cwd(), certification.pdfUrl.replace(/^\//, ''));

    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Archivo PDF no encontrado');
    }

    return filepath;
  }
}
