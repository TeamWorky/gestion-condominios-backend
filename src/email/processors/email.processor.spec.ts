import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { EmailProcessor } from './email.processor';
import { EmailService } from '../email.service';
import { LoggerService } from '../../logger/logger.service';
import { EmailJobData } from '../interfaces/email-job.interface';

describe('EmailProcessor', () => {
  let processor: EmailProcessor;
  let emailService: jest.Mocked<EmailService>;
  let logger: jest.Mocked<LoggerService>;

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    logWithMetadata: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProcessor,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
    emailService = module.get(EmailService);
    logger = module.get(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('process', () => {
    it('should process email job successfully', async () => {
      // Arrange
      const jobData: EmailJobData = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Test</h1>',
        text: 'Test',
      };

      const mockJob = {
        id: 'job-123',
        data: jobData,
        attemptsMade: 0,
      } as Job<EmailJobData>;

      emailService.sendEmail.mockResolvedValue({ sent: true });

      // Act
      await processor.process(mockJob);

      // Assert
      expect(emailService.sendEmail).toHaveBeenCalledWith(jobData);
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Processing email job'),
        EmailProcessor.name,
        expect.objectContaining({
          jobId: 'job-123',
          to: jobData.to,
          subject: jobData.subject,
          attempt: 1,
        }),
      );
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Email job completed successfully'),
        EmailProcessor.name,
        expect.objectContaining({
          jobId: 'job-123',
          to: jobData.to,
        }),
      );
    });

    it('should process email job with template', async () => {
      // Arrange
      const jobData: EmailJobData = {
        to: 'recipient@example.com',
        subject: 'Welcome',
        template: 'welcome' as any,
        variables: {
          name: 'John Doe',
          loginUrl: 'http://localhost:3000/login',
        },
      };

      const mockJob = {
        id: 'job-456',
        data: jobData,
        attemptsMade: 0,
      } as Job<EmailJobData>;

      emailService.sendEmail.mockResolvedValue({ sent: true });

      // Act
      await processor.process(mockJob);

      // Assert
      expect(emailService.sendEmail).toHaveBeenCalledWith(jobData);
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Processing email job'),
        EmailProcessor.name,
        expect.objectContaining({
          template: 'welcome',
        }),
      );
    });

    it('should handle email sending errors and re-throw for retry', async () => {
      // Arrange
      const jobData: EmailJobData = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Test</h1>',
      };

      const error = new Error('SMTP connection failed');
      const mockJob = {
        id: 'job-789',
        data: jobData,
        attemptsMade: 0,
      } as Job<EmailJobData>;

      emailService.sendEmail.mockRejectedValue(error);

      // Act & Assert — el processor relanza el error para que BullMQ lo reintente
      await expect(processor.process(mockJob)).rejects.toThrow(error);
    });

    it('should log correct attempt number on retry', async () => {
      // Arrange
      const jobData: EmailJobData = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Test</h1>',
      };

      const mockJob = {
        id: 'job-retry',
        data: jobData,
        attemptsMade: 2, // Third attempt
      } as Job<EmailJobData>;

      emailService.sendEmail.mockResolvedValue({ sent: true });

      // Act
      await processor.process(mockJob);

      // Assert
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Processing email job'),
        EmailProcessor.name,
        expect.objectContaining({
          attempt: 3, // attemptsMade + 1
        }),
      );
    });

    it('should process job with all email fields', async () => {
      // Arrange
      const jobData: EmailJobData = {
        to: 'recipient@example.com',
        subject: 'Complete Email',
        html: '<h1>HTML Content</h1>',
        text: 'Text Content',
        template: 'custom' as any,
        variables: {
          customVar: 'value',
        },
      };

      const mockJob = {
        id: 'job-complete',
        data: jobData,
        attemptsMade: 0,
      } as Job<EmailJobData>;

      emailService.sendEmail.mockResolvedValue({ sent: true });

      // Act
      await processor.process(mockJob);

      // Assert
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        to: jobData.to,
        subject: jobData.subject,
        template: jobData.template,
        html: jobData.html,
        text: jobData.text,
        variables: jobData.variables,
      });
    });
  });
});
