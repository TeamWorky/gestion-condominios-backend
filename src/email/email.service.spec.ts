import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailService } from './email.service';
import { LoggerService } from '../logger/logger.service';
import { EmailTemplatesService } from './templates/email-templates.service';
import { SendEmailDto, EmailTemplate } from './dto/send-email.dto';

// Mock nodemailer
jest.mock('nodemailer');
const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

describe('EmailService', () => {
  let service: EmailService;
  let configService: jest.Mocked<ConfigService>;
  let logger: jest.Mocked<LoggerService>;
  let templatesService: jest.Mocked<EmailTemplatesService>;

  const mockTransporter = {
    sendMail: jest.fn(),
    verify: jest.fn((callback) => {
      callback(null);
    }),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: 587,
        SMTP_USER: 'user@example.com',
        SMTP_PASSWORD: 'password123',
        SMTP_SECURE: false,
        SMTP_FROM: 'noreply@example.com',
        SMTP_FROM_NAME: 'Test App',
        APP_URL: 'http://localhost:3000',
      };
      return config[key] || defaultValue;
    }),
  };

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    logWithMetadata: jest.fn(),
  };

  const mockTemplatesService = {
    getTemplate: jest.fn(),
  };

  beforeEach(async () => {
    // Setup nodemailer mock before creating module
    mockedNodemailer.createTransport.mockReturnValue(mockTransporter as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
        {
          provide: EmailTemplatesService,
          useValue: mockTemplatesService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get(ConfigService);
    logger = module.get(LoggerService);
    templatesService = module.get(EmailTemplatesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully with HTML content', async () => {
      // Arrange
      const emailDto: SendEmailDto = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>',
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      // Act
      await service.sendEmail(emailDto);

      // Assert
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('Test App'),
          to: emailDto.to,
          subject: emailDto.subject,
          html: emailDto.html,
        }),
      );
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Email sent successfully'),
        EmailService.name,
        expect.any(Object),
      );
    });

    it('should send email successfully with text content', async () => {
      // Arrange
      const emailDto: SendEmailDto = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test text content',
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      // Act
      await service.sendEmail(emailDto);

      // Assert
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: emailDto.text,
        }),
      );
    });

    it('should send email with template', async () => {
      // Arrange
      const emailDto: SendEmailDto = {
        to: 'recipient@example.com',
        subject: 'Welcome',
        template: EmailTemplate.WELCOME,
        variables: { name: 'John', loginUrl: 'http://localhost:3000/login' },
      };

      const templateContent = {
        html: '<h1>Welcome John</h1>',
        text: 'Welcome John',
      };

      mockTemplatesService.getTemplate.mockReturnValue(templateContent);
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'test-message-id',
      });

      // Act
      await service.sendEmail(emailDto);

      // Assert
      expect(mockTemplatesService.getTemplate).toHaveBeenCalledWith(
        EmailTemplate.WELCOME,
        emailDto.variables,
      );
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: templateContent.html,
          text: templateContent.text,
        }),
      );
    });

    it('should throw error when transporter is not initialized', async () => {
      // Arrange
      const emailDto: SendEmailDto = {
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      };

      // Create a new service instance without proper SMTP config
      const incompleteConfigService = {
        get: jest.fn((key: string) => {
          return null; // All config values are null
        }),
      };

      const newService = new EmailService(
        incompleteConfigService as any,
        logger,
        templatesService,
      );

      // Act & Assert
      await expect(newService.sendEmail(emailDto)).rejects.toThrow(
        'SMTP transporter not initialized',
      );
    });

    it('should throw error when email content is missing', async () => {
      // Arrange
      const emailDto: SendEmailDto = {
        to: 'recipient@example.com',
        subject: 'Test',
        template: EmailTemplate.CUSTOM,
      };

      // Act & Assert
      await expect(service.sendEmail(emailDto)).rejects.toThrow(
        'Email content (html or text) is required',
      );
    });

    it('should handle email sending errors', async () => {
      // Arrange
      const emailDto: SendEmailDto = {
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      };

      const error = new Error('SMTP connection failed');
      mockTransporter.sendMail.mockRejectedValue(error);

      // Act & Assert
      await expect(service.sendEmail(emailDto)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send email'),
        error.stack,
        EmailService.name,
        expect.any(Object),
      );
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      // Arrange
      const to = 'user@example.com';
      const name = 'John Doe';
      const loginUrl = 'http://localhost:3000/login';

      const templateContent = {
        html: '<h1>Welcome John Doe</h1>',
        text: 'Welcome John Doe',
      };

      mockTemplatesService.getTemplate.mockReturnValue(templateContent);
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'welcome-message-id',
      });

      // Act
      await service.sendWelcomeEmail(to, name, loginUrl);

      // Assert
      expect(mockTemplatesService.getTemplate).toHaveBeenCalledWith(
        EmailTemplate.WELCOME,
        expect.objectContaining({
          name,
          loginUrl,
        }),
      );
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to,
          subject: 'Welcome to our platform!',
        }),
      );
    });

    it('should use default login URL when not provided', async () => {
      // Arrange
      const to = 'user@example.com';
      const name = 'John Doe';

      mockTemplatesService.getTemplate.mockReturnValue({
        html: '<h1>Welcome</h1>',
        text: 'Welcome',
      });
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'welcome-message-id',
      });

      // Act
      await service.sendWelcomeEmail(to, name);

      // Assert
      expect(mockTemplatesService.getTemplate).toHaveBeenCalledWith(
        EmailTemplate.WELCOME,
        expect.objectContaining({
          loginUrl: 'http://localhost:3000/login',
        }),
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      // Arrange
      const to = 'user@example.com';
      const name = 'John Doe';
      const resetUrl = 'http://localhost:3000/reset-password?token=abc123';
      const expiresIn = '1 hour';

      const templateContent = {
        html: '<h1>Reset Password</h1>',
        text: 'Reset Password',
      };

      mockTemplatesService.getTemplate.mockReturnValue(templateContent);
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'reset-message-id',
      });

      // Act
      await service.sendPasswordResetEmail(to, name, resetUrl, expiresIn);

      // Assert
      expect(mockTemplatesService.getTemplate).toHaveBeenCalledWith(
        EmailTemplate.PASSWORD_RESET,
        expect.objectContaining({
          name,
          resetUrl,
          expiresIn,
        }),
      );
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to,
          subject: 'Reset Your Password',
        }),
      );
    });

    it('should use default expiresIn when not provided', async () => {
      // Arrange
      const to = 'user@example.com';
      const name = 'John Doe';
      const resetUrl = 'http://localhost:3000/reset-password?token=abc123';

      mockTemplatesService.getTemplate.mockReturnValue({
        html: '<h1>Reset Password</h1>',
        text: 'Reset Password',
      });
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'reset-message-id',
      });

      // Act
      await service.sendPasswordResetEmail(to, name, resetUrl);

      // Assert
      expect(mockTemplatesService.getTemplate).toHaveBeenCalledWith(
        EmailTemplate.PASSWORD_RESET,
        expect.objectContaining({
          expiresIn: '1 hour',
        }),
      );
    });
  });

  describe('sendEmailVerificationEmail', () => {
    it('should send email verification email successfully', async () => {
      // Arrange
      const to = 'user@example.com';
      const name = 'John Doe';
      const verifyUrl = 'http://localhost:3000/verify-email?token=abc123';
      const expiresIn = '24 hours';

      const templateContent = {
        html: '<h1>Verify Email</h1>',
        text: 'Verify Email',
      };

      mockTemplatesService.getTemplate.mockReturnValue(templateContent);
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'verify-message-id',
      });

      // Act
      await service.sendEmailVerificationEmail(to, name, verifyUrl, expiresIn);

      // Assert
      expect(mockTemplatesService.getTemplate).toHaveBeenCalledWith(
        EmailTemplate.EMAIL_VERIFICATION,
        expect.objectContaining({
          name,
          verifyUrl,
          expiresIn,
        }),
      );
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to,
          subject: 'Verify Your Email Address',
        }),
      );
    });

    it('should use default expiresIn when not provided', async () => {
      // Arrange
      const to = 'user@example.com';
      const name = 'John Doe';
      const verifyUrl = 'http://localhost:3000/verify-email?token=abc123';

      mockTemplatesService.getTemplate.mockReturnValue({
        html: '<h1>Verify Email</h1>',
        text: 'Verify Email',
      });
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'verify-message-id',
      });

      // Act
      await service.sendEmailVerificationEmail(to, name, verifyUrl);

      // Assert
      expect(mockTemplatesService.getTemplate).toHaveBeenCalledWith(
        EmailTemplate.EMAIL_VERIFICATION,
        expect.objectContaining({
          expiresIn: '24 hours',
        }),
      );
    });
  });

  describe('initialization', () => {
    it('should initialize transporter with correct configuration', () => {
      // Arrange
      mockedNodemailer.createTransport.mockClear();
      const testTransporter = {
        sendMail: jest.fn(),
        verify: jest.fn((callback) => {
          callback(null);
        }),
      };
      mockedNodemailer.createTransport.mockReturnValueOnce(
        testTransporter as any,
      );

      const testConfigService = {
        get: jest.fn((key: string) => {
          const config: Record<string, any> = {
            SMTP_HOST: 'smtp.test.com',
            SMTP_PORT: 465,
            SMTP_USER: 'test@test.com',
            SMTP_PASSWORD: 'testpass',
            SMTP_SECURE: true,
          };
          return config[key];
        }),
      };

      // Act
      const newService = new EmailService(
        testConfigService as any,
        logger,
        templatesService,
      );

      // Assert
      expect(mockedNodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.test.com',
        port: 465,
        secure: true,
        auth: {
          user: 'test@test.com',
          pass: 'testpass',
        },
      });
    });

    it('should log warning when SMTP configuration is incomplete', () => {
      // Arrange
      mockedNodemailer.createTransport.mockClear();
      const incompleteConfigService = {
        get: jest.fn((key: string) => null),
      };

      // Act
      const newService = new EmailService(
        incompleteConfigService as any,
        logger,
        templatesService,
      );

      // Assert
      expect(logger.warn).toHaveBeenCalledWith(
        'SMTP configuration incomplete. Email service will not work properly.',
        EmailService.name,
        expect.any(Object),
      );
      expect(mockedNodemailer.createTransport).not.toHaveBeenCalled();
    });

    it('should call verify when transporter is initialized', (done) => {
      // Arrange
      mockedNodemailer.createTransport.mockClear();
      const error = new Error('Connection failed');
      const testTransporter = {
        sendMail: jest.fn(),
        verify: jest.fn((callback) => {
          // Simulate async callback
          setImmediate(() => {
            callback(error);
            // Assert after callback is called
            expect(logger.error).toHaveBeenCalledWith(
              'SMTP connection verification failed',
              error.stack,
              EmailService.name,
              expect.any(Object),
            );
            done();
          });
        }),
      };
      mockedNodemailer.createTransport.mockReturnValueOnce(
        testTransporter as any,
      );

      const testConfigService = {
        get: jest.fn((key: string) => {
          const config: Record<string, any> = {
            SMTP_HOST: 'smtp.test.com',
            SMTP_PORT: 587,
            SMTP_USER: 'test@test.com',
            SMTP_PASSWORD: 'testpass',
            SMTP_SECURE: false,
          };
          return config[key];
        }),
      };

      // Act
      const newService = new EmailService(
        testConfigService as any,
        logger,
        templatesService,
      );

      // Verify is called asynchronously, assertion is in callback
      expect(testTransporter.verify).toHaveBeenCalled();
    });
  });
});
