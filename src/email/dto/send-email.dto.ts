import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum EmailTemplate {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password-reset',
  EMAIL_VERIFICATION = 'email-verification',
  PASSWORD_CHANGED = 'password-changed',
  ACCOUNT_LOCKED = 'account-locked',
  CUSTOM = 'custom',
}

export class SendEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'Recipient email address', example: 'user@example.com' })
  to: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Email subject', example: 'Welcome to our platform' })
  subject: string;

  @IsEnum(EmailTemplate)
  @IsOptional()
  @ApiPropertyOptional({ 
    description: 'Email template to use', 
    enum: EmailTemplate,
    example: EmailTemplate.WELCOME 
  })
  template?: EmailTemplate;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'HTML content (if template is CUSTOM)', example: '<h1>Hello</h1>' })
  html?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Plain text content (if template is CUSTOM)', example: 'Hello' })
  text?: string;

  @ApiPropertyOptional({ description: 'Template variables', example: { name: 'John', link: 'https://...' } })
  variables?: Record<string, any>;
}







