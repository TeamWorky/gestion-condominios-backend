import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailQueueService } from './email-queue.service';
import { LoggerService } from '../logger/logger.service';
import { SendEmailDto } from './dto/send-email.dto';

describe('EmailQueueService', () => {
  let service: EmailQueueService;
  let emailQueue: jest.Mocked<Queue>;
  let logger: jest.Mocked<LoggerService>;

  const mockQueue = {
    add: jest.fn(),
    getJob: jest.fn(),
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
        EmailQueueService,
        {
          provide: getQueueToken('email'),
          useValue: mockQueue,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<EmailQueueService>(EmailQueueService);
    emailQueue = module.get(getQueueToken('email'));
    logger = module.get(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addEmailJob', () => {
    it('should add email job to queue successfully', async () => {
      // Arrange
      const emailDto: SendEmailDto = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Test</h1>',
      };

      const mockJob = {
        id: 'job-123',
      };

      mockQueue.add.mockResolvedValue(mockJob as any);

      // Act
      const jobId = await service.addEmailJob(emailDto);

      // Assert
      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-email',
        emailDto,
        expect.objectContaining({
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: {
            age: 24 * 3600,
            count: 1000,
          },
          removeOnFail: {
            age: 7 * 24 * 3600,
          },
        }),
      );
      expect(jobId).toBe('job-123');
      expect(logger.log).toHaveBeenCalledWith(
        expect.stringContaining('Email job added to queue'),
        EmailQueueService.name,
        expect.objectContaining({
          jobId: 'job-123',
          to: emailDto.to,
          subject: emailDto.subject,
        }),
      );
    });

    it('should add email job with custom options', async () => {
      // Arrange
      const emailDto: SendEmailDto = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Test</h1>',
      };

      const options = {
        delay: 5000,
        priority: 10,
      };

      const mockJob = {
        id: 'job-456',
      };

      mockQueue.add.mockResolvedValue(mockJob as any);

      // Act
      const jobId = await service.addEmailJob(emailDto, options);

      // Assert
      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-email',
        emailDto,
        expect.objectContaining({
          attempts: 3,
          delay: 5000,
          priority: 10,
        }),
      );
      expect(jobId).toBe('job-456');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should add welcome email job to queue', async () => {
      // Arrange
      const to = 'user@example.com';
      const name = 'John Doe';
      const loginUrl = 'http://localhost:3000/login';

      const mockJob = {
        id: 'welcome-job-123',
      };

      mockQueue.add.mockResolvedValue(mockJob as any);

      // Act
      const jobId = await service.sendWelcomeEmail(to, name, loginUrl);

      // Assert
      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          to,
          subject: 'Welcome to our platform!',
          template: 'welcome',
          variables: {
            name,
            loginUrl,
          },
        }),
        expect.any(Object),
      );
      expect(jobId).toBe('welcome-job-123');
    });

    it('should add welcome email without loginUrl', async () => {
      // Arrange
      const to = 'user@example.com';
      const name = 'John Doe';

      const mockJob = {
        id: 'welcome-job-456',
      };

      mockQueue.add.mockResolvedValue(mockJob as any);

      // Act
      const jobId = await service.sendWelcomeEmail(to, name);

      // Assert
      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          variables: {
            name,
            loginUrl: undefined,
          },
        }),
        expect.any(Object),
      );
      expect(jobId).toBe('welcome-job-456');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should add password reset email job to queue', async () => {
      // Arrange
      const to = 'user@example.com';
      const name = 'John Doe';
      const resetUrl = 'http://localhost:3000/reset-password?token=abc123';
      const expiresIn = '1 hour';

      const mockJob = {
        id: 'reset-job-123',
      };

      mockQueue.add.mockResolvedValue(mockJob as any);

      // Act
      const jobId = await service.sendPasswordResetEmail(
        to,
        name,
        resetUrl,
        expiresIn,
      );

      // Assert
      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          to,
          subject: 'Reset Your Password',
          template: 'password-reset',
          variables: {
            name,
            resetUrl,
            expiresIn,
          },
        }),
        expect.any(Object),
      );
      expect(jobId).toBe('reset-job-123');
    });

    it('should use default expiresIn when not provided', async () => {
      // Arrange
      const to = 'user@example.com';
      const name = 'John Doe';
      const resetUrl = 'http://localhost:3000/reset-password?token=abc123';

      const mockJob = {
        id: 'reset-job-456',
      };

      mockQueue.add.mockResolvedValue(mockJob as any);

      // Act
      const jobId = await service.sendPasswordResetEmail(to, name, resetUrl);

      // Assert
      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          to,
          subject: 'Reset Your Password',
          template: 'password-reset',
          variables: expect.objectContaining({
            name,
            resetUrl,
            expiresIn: '1 hour',
          }),
        }),
        expect.any(Object),
      );
      expect(jobId).toBe('reset-job-456');
    });
  });

  describe('sendEmailVerificationEmail', () => {
    it('should add email verification job to queue', async () => {
      // Arrange
      const to = 'user@example.com';
      const name = 'John Doe';
      const verifyUrl = 'http://localhost:3000/verify-email?token=abc123';
      const expiresIn = '24 hours';

      const mockJob = {
        id: 'verify-job-123',
      };

      mockQueue.add.mockResolvedValue(mockJob as any);

      // Act
      const jobId = await service.sendEmailVerificationEmail(
        to,
        name,
        verifyUrl,
        expiresIn,
      );

      // Assert
      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          to,
          subject: 'Verify Your Email Address',
          template: 'email-verification',
          variables: {
            name,
            verifyUrl,
            expiresIn,
          },
        }),
        expect.any(Object),
      );
      expect(jobId).toBe('verify-job-123');
    });

    it('should use default expiresIn when not provided', async () => {
      // Arrange
      const to = 'user@example.com';
      const name = 'John Doe';
      const verifyUrl = 'http://localhost:3000/verify-email?token=abc123';

      const mockJob = {
        id: 'verify-job-456',
      };

      mockQueue.add.mockResolvedValue(mockJob as any);

      // Act
      const jobId = await service.sendEmailVerificationEmail(
        to,
        name,
        verifyUrl,
      );

      // Assert
      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          to,
          subject: 'Verify Your Email Address',
          template: 'email-verification',
          variables: expect.objectContaining({
            name,
            verifyUrl,
            expiresIn: '24 hours',
          }),
        }),
        expect.any(Object),
      );
      expect(jobId).toBe('verify-job-456');
    });
  });

  describe('getJobStatus', () => {
    it('should return job status when job exists', async () => {
      // Arrange
      const jobId = 'job-123';
      const mockJob = {
        id: jobId,
        progress: 50,
        attemptsMade: 1,
        data: { to: 'user@example.com' },
        failedReason: null,
        finishedOn: null,
        processedOn: null,
        getState: jest.fn().mockResolvedValue('active'),
      };

      mockQueue.getJob.mockResolvedValue(mockJob as any);

      // Act
      const status = await service.getJobStatus(jobId);

      // Assert
      expect(mockQueue.getJob).toHaveBeenCalledWith(jobId);
      expect(mockJob.getState).toHaveBeenCalled();
      expect(status).toEqual({
        id: jobId,
        state: 'active',
        progress: 50,
        attemptsMade: 1,
        data: { to: 'user@example.com' },
        failedReason: null,
        finishedOn: null,
        processedOn: null,
      });
    });

    it('should return null when job does not exist', async () => {
      // Arrange
      const jobId = 'non-existent-job';

      mockQueue.getJob.mockResolvedValue(null);

      // Act
      const status = await service.getJobStatus(jobId);

      // Assert
      expect(mockQueue.getJob).toHaveBeenCalledWith(jobId);
      expect(status).toBeNull();
    });

    it('should return job status with failed reason', async () => {
      // Arrange
      const jobId = 'failed-job-123';
      const mockJob = {
        id: jobId,
        progress: 100,
        attemptsMade: 3,
        data: { to: 'user@example.com' },
        failedReason: 'SMTP connection failed',
        finishedOn: Date.now(),
        processedOn: Date.now() - 1000,
        getState: jest.fn().mockResolvedValue('failed'),
      };

      mockQueue.getJob.mockResolvedValue(mockJob as any);

      // Act
      const status = await service.getJobStatus(jobId);

      // Assert
      expect(status).toEqual(
        expect.objectContaining({
          state: 'failed',
          failedReason: 'SMTP connection failed',
        }),
      );
    });
  });
});
