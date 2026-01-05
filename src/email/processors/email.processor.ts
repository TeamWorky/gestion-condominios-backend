import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { LoggerService } from '../../logger/logger.service';
import { EmailService } from '../email.service';
import { EmailJobData } from '../interfaces/email-job.interface';

/**
 * Email queue processor
 * Processes email jobs from the queue
 */
@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, template, html, text, variables } = job.data;

    this.logger.log(
      `Processing email job: ${job.id}`,
      EmailProcessor.name,
      {
        jobId: job.id,
        to,
        subject,
        template,
        attempt: job.attemptsMade + 1,
      },
    );

    try {
      await this.emailService.sendEmail({
        to,
        subject,
        template,
        html,
        text,
        variables,
      });

      this.logger.log(
        `Email job completed successfully: ${job.id}`,
        EmailProcessor.name,
        { jobId: job.id, to },
      );
    } catch (error) {
      this.logger.error(
        `Email job failed: ${job.id}`,
        error.stack,
        EmailProcessor.name,
        {
          jobId: job.id,
          to,
          error: error.message,
          attempt: job.attemptsMade + 1,
        },
      );

      // Re-throw to trigger retry mechanism
      throw error;
    }
  }
}







