import { Injectable } from '@nestjs/common';
import { EmailTemplate } from '../dto/send-email.dto';

/**
 * Email templates service
 * Provides HTML and text templates for different email types
 */
@Injectable()
export class EmailTemplatesService {
  /**
   * Get template HTML by type
   */
  getTemplate(template: EmailTemplate, variables: Record<string, any> = {}): { html: string; text: string } {
    switch (template) {
      case EmailTemplate.WELCOME:
        return this.getWelcomeTemplate(variables);
      case EmailTemplate.PASSWORD_RESET:
        return this.getPasswordResetTemplate(variables);
      case EmailTemplate.EMAIL_VERIFICATION:
        return this.getEmailVerificationTemplate(variables);
      case EmailTemplate.PASSWORD_CHANGED:
        return this.getPasswordChangedTemplate(variables);
      case EmailTemplate.ACCOUNT_LOCKED:
        return this.getAccountLockedTemplate(variables);
      default:
        return { html: '', text: '' };
    }
  }

  private getWelcomeTemplate(variables: Record<string, any>): { html: string; text: string } {
    const name = variables.name || 'User';
    const loginUrl = variables.loginUrl || 'https://app.example.com/login';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
          <h1 style="color: #2c3e50;">Welcome, ${name}!</h1>
          <p>Thank you for joining our platform. We're excited to have you on board!</p>
          <p>You can now log in to your account and start using all the features we have to offer.</p>
          <div style="margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Log In</a>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">If you have any questions, feel free to contact our support team.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome, ${name}!

Thank you for joining our platform. We're excited to have you on board!

You can now log in to your account: ${loginUrl}

If you have any questions, feel free to contact our support team.
    `;

    return { html: html.trim(), text: text.trim() };
  }

  private getPasswordResetTemplate(variables: Record<string, any>): { html: string; text: string } {
    const name = variables.name || 'User';
    const resetUrl = variables.resetUrl || 'https://app.example.com/reset-password';
    const expiresIn = variables.expiresIn || '1 hour';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
          <h1 style="color: #2c3e50;">Reset Your Password</h1>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">This link will expire in ${expiresIn}.</p>
          <p style="color: #7f8c8d; font-size: 14px;">If you didn't request this, please ignore this email or contact support if you have concerns.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Reset Your Password

Hello ${name},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in ${expiresIn}.

If you didn't request this, please ignore this email or contact support if you have concerns.
    `;

    return { html: html.trim(), text: text.trim() };
  }

  private getEmailVerificationTemplate(variables: Record<string, any>): { html: string; text: string } {
    const name = variables.name || 'User';
    const verifyUrl = variables.verifyUrl || 'https://app.example.com/verify-email';
    const expiresIn = variables.expiresIn || '24 hours';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
          <h1 style="color: #2c3e50;">Verify Your Email</h1>
          <p>Hello ${name},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">This link will expire in ${expiresIn}.</p>
          <p style="color: #7f8c8d; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
Verify Your Email

Hello ${name},

Please verify your email address by clicking the link below:

${verifyUrl}

This link will expire in ${expiresIn}.

If you didn't create an account, please ignore this email.
    `;

    return { html: html.trim(), text: text.trim() };
  }

  private getPasswordChangedTemplate(variables: Record<string, any>): { html: string; text: string } {
    const name = variables.name || 'User';
    const supportUrl = variables.supportUrl || 'https://app.example.com/support';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
          <h1 style="color: #2c3e50;">Password Changed Successfully</h1>
          <p>Hello ${name},</p>
          <p>Your password has been successfully changed.</p>
          <p style="color: #7f8c8d; font-size: 14px;">If you didn't make this change, please contact our support team immediately: <a href="${supportUrl}">${supportUrl}</a></p>
        </div>
      </body>
      </html>
    `;

    const text = `
Password Changed Successfully

Hello ${name},

Your password has been successfully changed.

If you didn't make this change, please contact our support team immediately: ${supportUrl}
    `;

    return { html: html.trim(), text: text.trim() };
  }

  private getAccountLockedTemplate(variables: Record<string, any>): { html: string; text: string } {
    const name = variables.name || 'User';
    const unlockUrl = variables.unlockUrl || 'https://app.example.com/unlock-account';
    const supportUrl = variables.supportUrl || 'https://app.example.com/support';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Locked</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
          <h1 style="color: #e74c3c;">Account Locked</h1>
          <p>Hello ${name},</p>
          <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
          <p>You can unlock your account by clicking the button below:</p>
          <div style="margin: 30px 0;">
            <a href="${unlockUrl}" style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Unlock Account</a>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">If you have any questions, contact our support: <a href="${supportUrl}">${supportUrl}</a></p>
        </div>
      </body>
      </html>
    `;

    const text = `
Account Locked

Hello ${name},

Your account has been temporarily locked due to multiple failed login attempts.

You can unlock your account by visiting: ${unlockUrl}

If you have any questions, contact our support: ${supportUrl}
    `;

    return { html: html.trim(), text: text.trim() };
  }
}







