import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.fromEmail = this.configService.get<string>('EMAIL_FROM', 'noreply@talentonet.com');
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
  }

  /**
   * Send invitation email
   */
  async sendInvitation(email: string, token: string, invitedBy?: string): Promise<void> {
    const link = `${this.frontendUrl}/set-password?token=${token}`;
    
    const template = this.getInvitationTemplate(email, link, invitedBy);
    
    await this.send(email, template);
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, token: string): Promise<void> {
    const link = `${this.frontendUrl}/reset-password?token=${token}`;
    
    const template = this.getPasswordResetTemplate(email, link);
    
    await this.send(email, template);
  }

  /**
   * Send account activated notification
   */
  async sendAccountActivated(email: string, fullName: string): Promise<void> {
    const template = this.getAccountActivatedTemplate(fullName);
    
    await this.send(email, template);
  }

  /**
   * Send account suspended notification
   */
  async sendAccountSuspended(email: string, fullName: string, reason?: string): Promise<void> {
    const template = this.getAccountSuspendedTemplate(fullName, reason);
    
    await this.send(email, template);
  }

  /**
   * Send MFA enabled notification
   */
  async sendMfaEnabled(email: string, fullName: string): Promise<void> {
    const template = this.getMfaEnabledTemplate(fullName);
    
    await this.send(email, template);
  }

  /**
   * Send MFA disabled notification
   */
  async sendMfaDisabled(email: string, fullName: string): Promise<void> {
    const template = this.getMfaDisabledTemplate(fullName);
    
    await this.send(email, template);
  }

  /**
   * Core email sending method
   * In production, integrate with SendGrid, AWS SES, or SMTP server
   */
  private async send(to: string, template: EmailTemplate): Promise<void> {
    // TODO: Implement actual email sending
    // For development, just log the email
    this.logger.log(`[EMAIL] To: ${to}`);
    this.logger.log(`[EMAIL] Subject: ${template.subject}`);
    this.logger.log(`[EMAIL] Body:\n${template.text}`);
    
    // In production, use:
    // - SendGrid: await this.sendgridClient.send({ to, from: this.fromEmail, ...template })
    // - AWS SES: await this.sesClient.sendEmail(...)
    // - Nodemailer: await this.transporter.sendMail({ to, from: this.fromEmail, ...template })
  }

  // ===== EMAIL TEMPLATES =====

  private getInvitationTemplate(email: string, link: string, invitedBy?: string): EmailTemplate {
    const inviter = invitedBy || 'el equipo de TalentoNet';
    
    return {
      subject: 'Bienvenido a TalentoNet - Configura tu cuenta',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenido a TalentoNet</h1>
            </div>
            <div class="content">
              <p>Hola,</p>
              <p>${inviter} te ha invitado a unirte a TalentoNet.</p>
              <p>Para configurar tu cuenta y establecer tu contraseña, haz clic en el siguiente enlace:</p>
              <p style="text-align: center;">
                <a href="${link}" class="button">Configurar Mi Cuenta</a>
              </p>
              <p>Este enlace expirará en 48 horas.</p>
              <p>Si no solicitaste esta invitación, puedes ignorar este correo de forma segura.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 TalentoNet. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Bienvenido a TalentoNet\n\n${inviter} te ha invitado a unirte a TalentoNet.\n\nPara configurar tu cuenta, visita: ${link}\n\nEste enlace expirará en 48 horas.\n\n© 2024 TalentoNet`,
    };
  }

  private getPasswordResetTemplate(email: string, link: string): EmailTemplate {
    return {
      subject: 'Restablece tu contraseña - TalentoNet',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Restablecimiento de Contraseña</h1>
            </div>
            <div class="content">
              <p>Hola,</p>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en TalentoNet.</p>
              <p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p>
              <p style="text-align: center;">
                <a href="${link}" class="button">Restablecer Contraseña</a>
              </p>
              <p>Este enlace expirará en 1 hora por seguridad.</p>
              <p><strong>Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá sin cambios.</strong></p>
            </div>
            <div class="footer">
              <p>&copy; 2024 TalentoNet. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Restablecimiento de Contraseña\n\nRecibimos una solicitud para restablecer tu contraseña.\n\nVisita: ${link}\n\nEste enlace expira en 1 hora.\n\nSi no solicitaste esto, ignora este correo.\n\n© 2024 TalentoNet`,
    };
  }

  private getAccountActivatedTemplate(fullName: string): EmailTemplate {
    return {
      subject: 'Tu cuenta ha sido activada - TalentoNet',
      html: `
        <h1>Cuenta Activada</h1>
        <p>Hola ${fullName},</p>
        <p>Tu cuenta en TalentoNet ha sido activada exitosamente. Ya puedes acceder a todas las funcionalidades del sistema.</p>
        <p>Saludos,<br>El equipo de TalentoNet</p>
      `,
      text: `Cuenta Activada\n\nHola ${fullName},\n\nTu cuenta en TalentoNet ha sido activada. Ya puedes acceder al sistema.\n\nSaludos,\nEl equipo de TalentoNet`,
    };
  }

  private getAccountSuspendedTemplate(fullName: string, reason?: string): EmailTemplate {
    const reasonText = reason ? `\n\nMotivo: ${reason}` : '';
    
    return {
      subject: 'Tu cuenta ha sido suspendida - TalentoNet',
      html: `
        <h1>Cuenta Suspendida</h1>
        <p>Hola ${fullName},</p>
        <p>Tu cuenta en TalentoNet ha sido suspendida.${reasonText}</p>
        <p>Si tienes preguntas, contacta al administrador del sistema.</p>
        <p>Saludos,<br>El equipo de TalentoNet</p>
      `,
      text: `Cuenta Suspendida\n\nHola ${fullName},\n\nTu cuenta ha sido suspendida.${reasonText}\n\nContacta al administrador para más información.\n\nSaludos,\nEl equipo de TalentoNet`,
    };
  }

  private getMfaEnabledTemplate(fullName: string): EmailTemplate {
    return {
      subject: 'Autenticación de dos factores activada - TalentoNet',
      html: `
        <h1>MFA Activada</h1>
        <p>Hola ${fullName},</p>
        <p>La autenticación de dos factores (MFA) ha sido activada en tu cuenta.</p>
        <p>Esto agrega una capa adicional de seguridad. Necesitarás tu aplicación de autenticación para iniciar sesión.</p>
        <p>Si no realizaste este cambio, contacta al administrador inmediatamente.</p>
        <p>Saludos,<br>El equipo de TalentoNet</p>
      `,
      text: `MFA Activada\n\nHola ${fullName},\n\nLa autenticación de dos factores ha sido activada en tu cuenta.\n\nSi no fuiste tú, contacta al administrador.\n\nSaludos,\nEl equipo de TalentoNet`,
    };
  }

  private getMfaDisabledTemplate(fullName: string): EmailTemplate {
    return {
      subject: 'Autenticación de dos factores desactivada - TalentoNet',
      html: `
        <h1>MFA Desactivada</h1>
        <p>Hola ${fullName},</p>
        <p>La autenticación de dos factores (MFA) ha sido desactivada en tu cuenta.</p>
        <p>Si no realizaste este cambio, contacta al administrador inmediatamente y considera reactivar MFA para mayor seguridad.</p>
        <p>Saludos,<br>El equipo de TalentoNet</p>
      `,
      text: `MFA Desactivada\n\nHola ${fullName},\n\nLa autenticación de dos factores ha sido desactivada.\n\nSi no fuiste tú, contacta al administrador.\n\nSaludos,\nEl equipo de TalentoNet`,
    };
  }
}
