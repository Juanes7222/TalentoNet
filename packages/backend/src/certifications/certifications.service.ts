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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 0;
      margin: 0;
    }
    
    .certificate-container {
      background: white;
      margin: 0;
      padding: 0;
      position: relative;
      overflow: hidden;
    }
    
    /* Header con gradiente moderno */
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 60px;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
    
    .header::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -5%;
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }
    
    .logo-box {
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }
    
    .logo-icon {
      width: 35px;
      height: 35px;
      fill: white;
    }
    
    .company-name {
      font-size: 32px;
      font-weight: 700;
      color: white;
      letter-spacing: 2px;
    }
    
    .header-info {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      line-height: 1.6;
      position: relative;
      z-index: 1;
    }
    
    /* Título del documento */
    .doc-title-section {
      text-align: center;
      padding: 50px 60px 30px;
      position: relative;
    }
    
    .doc-title {
      font-size: 36px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
      letter-spacing: 3px;
    }
    
    .doc-subtitle {
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    /* Decoración */
    .divider {
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      margin: 20px auto;
      border-radius: 2px;
    }
    
    /* Contenido principal */
    .content {
      padding: 20px 60px 40px;
      line-height: 1.9;
      color: #334155;
      font-size: 15px;
    }
    
    .certifica-box {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
      border-left: 5px solid #667eea;
      padding: 25px 30px;
      margin: 30px 0;
      border-radius: 8px;
      text-align: center;
    }
    
    .certifica-text {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
      letter-spacing: 4px;
    }
    
    /* Card de información del empleado */
    .employee-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 30px;
      margin: 30px 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    
    .employee-row {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .employee-row:last-child {
      border-bottom: none;
    }
    
    .employee-label {
      font-weight: 600;
      color: #667eea;
      min-width: 180px;
      font-size: 14px;
    }
    
    .employee-value {
      color: #1e293b;
      font-weight: 500;
      flex: 1;
    }
    
    /* Párrafos de contenido */
    .content p {
      margin: 20px 0;
      text-align: justify;
    }
    
    .content strong {
      color: #1e293b;
      font-weight: 600;
    }
    
    .highlight-box {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
      padding: 20px 25px;
      border-radius: 8px;
      margin: 25px 0;
      border-left: 4px solid #667eea;
    }
    
    /* Sección de firma */
    .signature-section {
      padding: 60px 60px 40px;
      text-align: center;
    }
    
    .signature-box {
      display: inline-block;
      padding-top: 60px;
      position: relative;
    }
    
    .signature-line {
      width: 300px;
      border-top: 2px solid #334155;
      padding-top: 15px;
      margin: 0 auto;
    }
    
    .signature-name {
      font-weight: 700;
      color: #1e293b;
      font-size: 16px;
      margin-bottom: 5px;
    }
    
    .signature-title {
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
    }
    
    /* Footer moderno */
    .footer {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      padding: 30px 60px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 12px;
    }
    
    .footer-grid {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .footer-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .verification-code {
      background: rgba(255, 255, 255, 0.1);
      padding: 8px 15px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-weight: 600;
      letter-spacing: 2px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    /* Marca de agua sutil */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      font-weight: 900;
      color: rgba(102, 126, 234, 0.03);
      z-index: 0;
      pointer-events: none;
      letter-spacing: 10px;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <!-- Marca de agua -->
    <div class="watermark">TALENTUM</div>
    
    <!-- Header con diseño moderno -->
    <div class="header">
      <div class="logo-section">
        <div class="logo-box">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="white">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <div class="company-name">TALENTUM</div>
      </div>
      <div class="header-info">
        <div>NIT: 900.123.456-7</div>
        <div>Sistema de Gestión de Recursos Humanos</div>
        <div>Bogotá D.C., Colombia</div>
      </div>
    </div>

    <!-- Título del documento -->
    <div class="doc-title-section">
      <div class="doc-title">CERTIFICACIÓN LABORAL</div>
      <div class="divider"></div>
      <div class="doc-subtitle">Documento Oficial</div>
    </div>

    <!-- Contenido -->
    <div class="content">
      <p>La suscrita Gerente de Recursos Humanos de <strong>TALENTUM S.A.S.</strong></p>
      
      <div class="certifica-box">
        <div class="certifica-text">CERTIFICA QUE</div>
      </div>

      <div class="employee-card">
        <div class="employee-row">
          <div class="employee-label">Nombre Completo:</div>
          <div class="employee-value">${employee.firstName} ${employee.lastName}</div>
        </div>
        <div class="employee-row">
          <div class="employee-label">Identificación:</div>
          <div class="employee-value">${employee.identificationType} ${employee.identificationNumber}</div>
        </div>
        ${certification.incluirCargo && contract ? `
        <div class="employee-row">
          <div class="employee-label">Cargo:</div>
          <div class="employee-value">${contract.position}</div>
        </div>
        <div class="employee-row">
          <div class="employee-label">Departamento:</div>
          <div class="employee-value">${contract.department}</div>
        </div>
        ` : ''}
      </div>

      ${
        certification.incluirTiempoServicio
          ? `
      <div class="highlight-box">
        <p style="margin: 0;">
          Labora en nuestra empresa desde el <strong>${hireDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>,
          con un tiempo de servicio de <strong>${years} año(s) y ${months} mes(es)</strong>, desempeñando sus funciones 
          de manera destacada y comprometida.
        </p>
      </div>
      `
          : ''
      }

      ${
        certification.incluirSalario && contract
          ? `
      <div class="highlight-box">
        <p style="margin: 0;">
          Su salario básico mensual actual es de <strong>$${contract.salary.toLocaleString('es-CO')} COP</strong>.
        </p>
      </div>
      `
          : ''
      }

      <p>
        El empleado se encuentra actualmente en estado <strong>${employee.status === 'active' ? 'ACTIVO' : employee.status.toUpperCase()}</strong> 
        en nuestra organización, cumpliendo satisfactoriamente con sus responsabilidades laborales.
      </p>

      <p>
        Se expide la presente certificación a solicitud del interesado para ${certification.motivo.toLowerCase()}, 
        en la ciudad de Bogotá D.C., a los ${new Date().getDate()} días del mes de 
        ${new Date().toLocaleDateString('es-CO', { month: 'long' })} de ${new Date().getFullYear()}.
      </p>
    </div>

    <!-- Firma -->
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line">
          <div class="signature-name">María Fernanda González</div>
          <div class="signature-title">Gerente de Recursos Humanos</div>
          <div class="signature-title">TALENTUM S.A.S</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-grid">
        <div class="footer-item">
          <span>📅 Generado:</span>
          <span>${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="footer-item">
          <span>🔒 Código de Verificación:</span>
          <span class="verification-code">${certification.id.substring(0, 8).toUpperCase()}</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  private async htmlToPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm',
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