import { SendEmailDto } from '../dto/send-email.dto';

export interface EmailJobData extends SendEmailDto {
  jobId?: string;
  attempts?: number;
  createdAt?: Date;
}







