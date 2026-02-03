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

    this.logger.log(`Processing email job: ${job.id}`, EmailProcessor.name, {
      jobId: job.id,
      to,
      subject,
      template,
      attempt: job.attemptsMade + 1,
    });

    const result = await this.emailService.sendEmail({
      to,
      subject,
      template,
      html,
      text,
      variables,
    });

    if (result.sent) {
      this.logger.log(
        `Email job completed successfully: ${job.id}`,
        EmailProcessor.name,
        { jobId: job.id, to },
      );
    } else {
      this.logger.warn(
        `Email job skipped (service disabled): ${job.id}`,
        EmailProcessor.name,
        { jobId: job.id, to, reason: result.reason },
      );
    }
  }
}
