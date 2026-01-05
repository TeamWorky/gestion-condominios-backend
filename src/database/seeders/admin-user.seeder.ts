import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class AdminUserSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}
  private readonly MAX_RETRIES = 5;
  private readonly INITIAL_DELAY = 2000; // 2 seconds
  private readonly MAX_DELAY = 30000; // 30 seconds

  async onModuleInit() {
    // Wait a bit for database to be ready
    await this.delay(this.INITIAL_DELAY);
    await this.seedAdminUserWithRetry();
  }

  /**
   * Attempts to run the seeder with retries and exponential backoff
   */
  private async seedAdminUserWithRetry(): Promise<void> {
    let attempt = 0;
    let delay = this.INITIAL_DELAY;

    while (attempt < this.MAX_RETRIES) {
      try {
        await this.seedAdminUser();
        return; // Success, exit loop
      } catch (error) {
        attempt++;
        
        // If it's the last attempt, log error
        if (attempt >= this.MAX_RETRIES) {
          this.logger.error(
            `Failed to seed admin user after ${this.MAX_RETRIES} attempts`,
            error.stack || error.message,
            AdminUserSeeder.name,
            {
              attempts: this.MAX_RETRIES,
              error: error.message,
            },
          );
          // Don't throw error to allow app to start
          // but log critical error
          this.logger.error(
            '⚠️  CRITICAL: Admin user seeder failed. Please check database connection and configuration.',
            undefined,
            AdminUserSeeder.name,
          );
          return;
        }

        // Determine if error is recoverable
        if (this.isRecoverableError(error)) {
          this.logger.warn(
            `Attempt ${attempt}/${this.MAX_RETRIES} failed. Retrying in ${delay}ms...`,
            AdminUserSeeder.name,
            {
              attempt,
              maxRetries: this.MAX_RETRIES,
              delay,
              error: error.message,
            },
          );
          await this.delay(delay);
          // Exponential backoff with jitter
          delay = Math.min(delay * 2, this.MAX_DELAY);
        } else {
          // Non-recoverable error (e.g., duplicate email, validation)
          this.logger.error(
            `Non-recoverable error during admin user seeding: ${error.message}`,
            error.stack,
            AdminUserSeeder.name,
            {
              error: error.message,
            },
          );
          return;
        }
      }
    }
  }

  /**
   * Executes the admin user seeding
   */
  private async seedAdminUser(): Promise<void> {
    // Validate that repository is initialized
    if (!this.userRepository) {
      throw new Error('User repository is not initialized');
    }

    // Get admin credentials from environment variables
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@admin.com';
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD') || 'admin';
    const adminFirstName = this.configService.get<string>('ADMIN_FIRST_NAME') || 'Admin';
    const adminLastName = this.configService.get<string>('ADMIN_LAST_NAME') || 'User';

    // Validate email format
    if (!adminEmail || !this.isValidEmail(adminEmail)) {
      throw new Error(`Invalid admin email: ${adminEmail}`);
    }

    // Validate password has at least 8 characters
    if (!adminPassword || adminPassword.length < 8) {
      this.logger.warn(
        `⚠️  Admin password is too short (${adminPassword.length} chars). Minimum 8 characters required.`,
        AdminUserSeeder.name,
        {
          passwordLength: adminPassword?.length || 0,
        },
      );
    }

    this.logger.log(
      `Starting admin user seeding for email: ${adminEmail}`,
      AdminUserSeeder.name,
      { email: adminEmail },
    );

    // Verify database connection
    try {
      await this.userRepository.query('SELECT 1');
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    // Check if admin user already exists
    let existingAdmin: User | null = null;
    try {
      existingAdmin = await this.userRepository.findOne({
        where: { email: adminEmail },
      });
    } catch (error) {
      throw new Error(`Failed to query existing admin user: ${error.message}`);
    }

    if (existingAdmin) {
      this.logger.log(
        `Admin user already exists, skipping seed`,
        AdminUserSeeder.name,
        {
          userId: existingAdmin.id,
          email: adminEmail,
        },
      );
      return;
    }

    // Create default admin user
    const adminUser = this.userRepository.create({
      email: adminEmail,
      password: adminPassword, // Will be hashed by the entity hook
      firstName: adminFirstName,
      lastName: adminLastName,
      role: Role.SUPER_ADMIN,
      isActive: true,
    });

    try {
      await this.userRepository.save(adminUser);
    } catch (error) {
      // Handle specific database errors
      if (error instanceof QueryFailedError) {
        // Constraint error (e.g., duplicate email)
        if (error.message.includes('unique') || error.message.includes('duplicate')) {
          this.logger.log(
            'Admin user already exists (detected by constraint), skipping seed',
            AdminUserSeeder.name,
            { email: adminEmail },
          );
          return;
        }
        throw new Error(`Database constraint error: ${error.message}`);
      }
      throw error;
    }

    this.logger.warn(
      '✅ DEFAULT ADMIN USER CREATED SUCCESSFULLY',
      AdminUserSeeder.name,
      {
        email: adminEmail,
        userId: adminUser.id,
        passwordMasked: '*'.repeat(adminPassword.length),
        warning: '⚠️  IMPORTANT: Change these credentials in production!',
      },
    );
  }

  /**
   * Determines if an error is recoverable (e.g., DB connection)
   */
  private isRecoverableError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toLowerCase() || '';

    // Connection errors are recoverable
    if (
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('econnrefused') ||
      errorMessage.includes('network') ||
      errorCode === 'econnrefused' ||
      errorCode === 'etimedout'
    ) {
      return true;
    }

    // Constraint or validation errors are NOT recoverable
    if (
      errorMessage.includes('unique') ||
      errorMessage.includes('duplicate') ||
      errorMessage.includes('constraint') ||
      errorMessage.includes('validation')
    ) {
      return false;
    }

    // By default, assume it's recoverable
    return true;
  }

  /**
   * Validates basic email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
