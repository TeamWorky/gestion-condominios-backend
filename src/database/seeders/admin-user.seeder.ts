import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Condominium } from '../../condominiums/entities/condominium.entity';
import { Role } from '../../common/enums/role.enum';
import { LoggerService } from '../../logger/logger.service';
import { RedisCacheService } from '../../redis/redis-cache.service';

@Injectable()
export class AdminUserSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Condominium)
    private readonly condominiumRepository: Repository<Condominium>,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly cache: RedisCacheService,
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
    const adminEmail =
      this.configService.get<string>('ADMIN_EMAIL') || 'admin@admin.com';
    const adminPassword =
      this.configService.get<string>('ADMIN_PASSWORD') || 'admin';
    const adminFirstName =
      this.configService.get<string>('ADMIN_FIRST_NAME') || 'Admin';
    const adminLastName =
      this.configService.get<string>('ADMIN_LAST_NAME') || 'User';

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
      // Aún así, asegurar que todos los SUPER_ADMIN tengan todos los condominios
      await this.associateAllCondominiumsToAllSuperAdmins();
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
        if (
          error.message.includes('unique') ||
          error.message.includes('duplicate')
        ) {
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

    // Asociar todos los condominios existentes al SUPER_ADMIN recién creado
    await this.associateAllCondominiumsToSuperAdmin(adminUser.id);
  }

  /**
   * Asocia todos los condominios existentes al usuario SUPER_ADMIN
   */
  private async associateAllCondominiumsToSuperAdmin(userId: string): Promise<void> {
    try {
      // Esperar un poco para asegurar que los condominios se hayan creado
      await this.delay(2000);

      const superAdmin = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['condominios'],
      });

      if (!superAdmin || superAdmin.role !== Role.SUPER_ADMIN) {
        return;
      }

      // Obtener todos los condominios activos
      const allCondominiums = await this.condominiumRepository.find({
        where: { isActive: true },
      });

      if (allCondominiums.length === 0) {
        this.logger.log(
          'No condominiums found to associate',
          AdminUserSeeder.name,
        );
        return;
      }

      // Obtener IDs de condominios ya asociados
      const associatedIds = superAdmin.condominios?.map((c) => c.id) || [];

      // Filtrar condominios que no están asociados
      const condominiumsToAdd = allCondominiums.filter(
        (c) => !associatedIds.includes(c.id),
      );

      if (condominiumsToAdd.length === 0) {
        this.logger.log(
          'All condominiums already associated to super admin',
          AdminUserSeeder.name,
          {
            userId: superAdmin.id,
            email: superAdmin.email,
            totalCondominiums: allCondominiums.length,
          },
        );
        return;
      }

      // Asociar los condominios faltantes
      if (!superAdmin.condominios) {
        superAdmin.condominios = [];
      }
      superAdmin.condominios.push(...condominiumsToAdd);
      await this.userRepository.save(superAdmin);

      // Invalidar cache del usuario para forzar refresco de condominios (si está disponible)
      try {
        await this.cache.invalidate(`user:${superAdmin.id}`);
        await this.cache.invalidate(`user:email:${superAdmin.email}`);
      } catch (cacheError) {
        // Si falla el cache, no es crítico, solo loguear
        this.logger.warn(
          'Failed to invalidate cache (non-critical)',
          AdminUserSeeder.name,
          { error: cacheError.message },
        );
      }

      this.logger.log(
        'All condominiums associated to super admin successfully',
        AdminUserSeeder.name,
        {
          userId: superAdmin.id,
          email: superAdmin.email,
          totalCondominiums: allCondominiums.length,
          newlyAssociated: condominiumsToAdd.length,
          condominiumNames: condominiumsToAdd.map((c) => c.name),
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to associate all condominiums to super admin',
        error.stack || error.message,
        AdminUserSeeder.name,
        { error: error.message, userId },
      );
    }
  }

  /**
   * Asocia todos los condominios a TODOS los usuarios SUPER_ADMIN existentes
   */
  private async associateAllCondominiumsToAllSuperAdmins(): Promise<void> {
    try {
      await this.delay(3000); // Esperar más tiempo para asegurar que todo esté listo

      // Buscar TODOS los usuarios SUPER_ADMIN
      const allSuperAdmins = await this.userRepository.find({
        where: { role: Role.SUPER_ADMIN },
        relations: ['condominios'],
      });

      if (allSuperAdmins.length === 0) {
        this.logger.log(
          'No SUPER_ADMIN users found',
          AdminUserSeeder.name,
        );
        return;
      }

      // Obtener todos los condominios activos
      const allCondominiums = await this.condominiumRepository.find({
        where: { isActive: true },
      });

      if (allCondominiums.length === 0) {
        this.logger.log(
          'No condominiums found to associate',
          AdminUserSeeder.name,
        );
        return;
      }

      this.logger.log(
        `Associating ${allCondominiums.length} condominiums to ${allSuperAdmins.length} SUPER_ADMIN users`,
        AdminUserSeeder.name,
      );

      // Asociar todos los condominios a cada SUPER_ADMIN
      for (const superAdmin of allSuperAdmins) {
        const associatedIds = superAdmin.condominios?.map((c) => c.id) || [];
        const condominiumsToAdd = allCondominiums.filter(
          (c) => !associatedIds.includes(c.id),
        );

        if (condominiumsToAdd.length > 0) {
          if (!superAdmin.condominios) {
            superAdmin.condominios = [];
          }
          superAdmin.condominios.push(...condominiumsToAdd);
          await this.userRepository.save(superAdmin);

          // Invalidar cache (si está disponible)
          try {
            await this.cache.invalidate(`user:${superAdmin.id}`);
            await this.cache.invalidate(`user:email:${superAdmin.email}`);
          } catch (cacheError) {
            // Si falla el cache, no es crítico, solo loguear
            this.logger.warn(
              'Failed to invalidate cache (non-critical)',
              AdminUserSeeder.name,
              { error: cacheError.message, email: superAdmin.email },
            );
          }

          this.logger.log(
            `Associated ${condominiumsToAdd.length} condominiums to SUPER_ADMIN: ${superAdmin.email}`,
            AdminUserSeeder.name,
            {
              userId: superAdmin.id,
              email: superAdmin.email,
              newlyAssociated: condominiumsToAdd.length,
              condominiumNames: condominiumsToAdd.map((c) => c.name),
            },
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Failed to associate all condominiums to all super admins',
        error.stack || error.message,
        AdminUserSeeder.name,
        { error: error.message },
      );
    }
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
