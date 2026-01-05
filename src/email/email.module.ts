import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { EmailService } from './email.service';
import { EmailQueueService } from './email-queue.service';
import { EmailProcessor } from './processors/email.processor';
import { EmailTemplatesService } from './templates/email-templates.service';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [
    EmailService,
    EmailQueueService,
    EmailProcessor,
    EmailTemplatesService,
  ],
  exports: [EmailService, EmailQueueService],
})
export class EmailModule {}







