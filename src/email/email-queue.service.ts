import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LoggerService } from '../logger/logger.service';
import { SendEmailDto } from './dto/send-email.dto';

/**
 * Email queue service
 * Adds email jobs to the queue for async processing
 */
@Injectable()
export class EmailQueueService {
  constructor(
    @InjectQueue('email')
    private readonly emailQueue: Queue,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Add email job to queue
   */
  async addEmailJob(emailDto: SendEmailDto, options?: { delay?: number; priority?: number }): Promise<string> {
    const job = await this.emailQueue.add('send-email', emailDto, {
      attempts: 3, // Retry up to 3 times
      backoff: {
        type: 'exponential',
        delay: 2000, // Start with 2 seconds
      },
      removeOnComplete: {
        age: 24 * 3600, // Keep completed jobs for 24 hours
        count: 1000, // Keep last 1000 completed jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // Keep failed jobs for 7 days
      },
      ...options,
    });

    this.logger.log(
      `Email job added to queue: ${job.id}`,
      EmailQueueService.name,
      {
        jobId: job.id,
        to: emailDto.to,
        subject: emailDto.subject,
      },
    );

    return job.id!;
  }

  /**
   * Add welcome email to queue
   */
  async sendWelcomeEmail(to: string, name: string, loginUrl?: string): Promise<string> {
    return this.addEmailJob({
      to,
      subject: 'Welcome to our platform!',
      template: 'welcome' as any,
      variables: {
        name,
        loginUrl,
      },
    });
  }

  /**
   * Add password reset email to queue
   */
  async sendPasswordResetEmail(to: string, name: string, resetUrl: string, expiresIn = '1 hour'): Promise<string> {
    return this.addEmailJob({
      to,
      subject: 'Reset Your Password',
      template: 'password-reset' as any,
      variables: {
        name,
        resetUrl,
        expiresIn,
      },
    });
  }

  /**
   * Add email verification email to queue
   */
  async sendEmailVerificationEmail(to: string, name: string, verifyUrl: string, expiresIn = '24 hours'): Promise<string> {
    return this.addEmailJob({
      to,
      subject: 'Verify Your Email Address',
      template: 'email-verification' as any,
      variables: {
        name,
        verifyUrl,
        expiresIn,
      },
    });
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.emailQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress;

    return {
      id: job.id,
      state,
      progress,
      attemptsMade: job.attemptsMade,
      data: job.data,
      failedReason: job.failedReason,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
    };
  }
}







