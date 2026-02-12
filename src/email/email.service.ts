import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { LoggerService } from '../logger/logger.service';
import { SendEmailDto, EmailTemplate } from './dto/send-email.dto';
import { EmailTemplatesService } from './templates/email-templates.service';

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;
  private isEnabled: boolean = false;
  private isConfigured: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly templatesService: EmailTemplatesService,
  ) {
    this.initializeTransporter();
  }

  /**
   * Check if email service is enabled and operational
   */
  isOperational(): boolean {
    return this.isEnabled && this.isConfigured && this.transporter !== null;
  }

  /**
   * Initialize nodemailer transporter
   */
  private initializeTransporter(): void {
    // Check if email is explicitly disabled
    const emailEnabled = this.configService.get<string>('EMAIL_ENABLED', 'true');
    if (emailEnabled === 'false' || emailEnabled === '0') {
      this.logger.log(
        'Email service is disabled by configuration (EMAIL_ENABLED=false)',
        EmailService.name,
      );
      this.isEnabled = false;
      return;
    }

    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');
    const smtpSecure = this.configService.get<boolean>('SMTP_SECURE', false);

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      this.logger.warn(
        'Email service disabled: SMTP configuration incomplete. Set EMAIL_ENABLED=false to suppress this warning.',
        EmailService.name,
        { smtpHost: !!smtpHost, smtpPort: !!smtpPort, smtpUser: !!smtpUser, smtpPassword: !!smtpPassword },
      );
      this.isEnabled = false;
      return;
    }

    this.isConfigured = true;

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        this.logger.warn(
          'Email service disabled: SMTP credentials invalid or server unreachable. Emails will not be sent.',
          EmailService.name,
          { error: error.message },
        );
        this.isEnabled = false;
        this.transporter = null;
      } else {
        this.logger.log('Email service enabled: SMTP connection verified successfully', EmailService.name);
        this.isEnabled = true;
      }
    });
  }

  /**
   * Send email directly (synchronous)
   */
  async sendEmail(emailDto: SendEmailDto): Promise<{ sent: boolean; reason?: string }> {
    if (!this.isOperational()) {
      this.logger.debug(
        `Email not sent (service disabled): ${emailDto.subject} to ${emailDto.to}`,
        EmailService.name,
      );
      return { sent: false, reason: 'Email service is not enabled or configured' };
    }

    const { to, subject, template, html, text, variables = {} } = emailDto;

    let emailHtml = html;
    let emailText = text;

    // Use template if provided
    if (template && template !== EmailTemplate.CUSTOM) {
      const templateContent = this.templatesService.getTemplate(
        template,
        variables,
      );
      emailHtml = templateContent.html;
      emailText = templateContent.text;
    }

    if (!emailHtml && !emailText) {
      throw new Error('Email content (html or text) is required');
    }

    const from =
      this.configService.get<string>('SMTP_FROM') ||
      this.configService.get<string>('SMTP_USER');

    try {
      const info = await this.transporter!.sendMail({
        from: `"${this.configService.get<string>('SMTP_FROM_NAME', 'NestJS App')}" <${from}>`,
        to,
        subject,
        html: emailHtml,
        text: emailText,
      });

      this.logger.log(
        `Email sent successfully to ${to}`,
        EmailService.name,
        {
          to,
          subject,
          messageId: info.messageId,
        },
      );

      return { sent: true };
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}`,
        error.stack,
        EmailService.name,
        {
          to,
          subject,
          error: error.message,
        },
      );
      return { sent: false, reason: error.message };
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, name: string, loginUrl?: string): Promise<{ sent: boolean; reason?: string }> {
    return this.sendEmail({
      to,
      subject: 'Welcome to our platform!',
      template: EmailTemplate.WELCOME,
      variables: {
        name,
        loginUrl:
          loginUrl ||
          this.configService.get<string>('APP_URL', 'http://localhost:3000') +
            '/login',
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, name: string, resetUrl: string, expiresIn = '1 hour'): Promise<{ sent: boolean; reason?: string }> {
    return this.sendEmail({
      to,
      subject: 'Reset Your Password',
      template: EmailTemplate.PASSWORD_RESET,
      variables: {
        name,
        resetUrl,
        expiresIn,
      },
    });
  }

  /**
   * Send email verification email
   */
  async sendEmailVerificationEmail(to: string, name: string, verifyUrl: string, expiresIn = '24 hours'): Promise<{ sent: boolean; reason?: string }> {
    return this.sendEmail({
      to,
      subject: 'Verify Your Email Address',
      template: EmailTemplate.EMAIL_VERIFICATION,
      variables: {
        name,
        verifyUrl,
        expiresIn,
      },
    });
  }
}
