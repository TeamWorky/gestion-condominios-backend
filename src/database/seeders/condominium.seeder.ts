import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Condominium } from '../../condominiums/entities/condominium.entity';
import { Building } from '../../buildings/entities/building.entity';
import { Unit } from '../../units/entities/unit.entity';
import { User } from '../../users/entities/user.entity';
import { UnitType } from '../../common/enums/unit-type.enum';
import { UnitStatus } from '../../common/enums/unit-status.enum';
import { Role } from '../../common/enums/role.enum';
import { LoggerService } from '../../logger/logger.service';
import { RedisCacheService } from '../../redis/redis-cache.service';

@Injectable()
export class CondominiumSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(Condominium)
    private readonly condominiumRepository: Repository<Condominium>,
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly cache: RedisCacheService,
  ) {}

  async onModuleInit() {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    if (nodeEnv !== 'development') {
      this.logger.log(
        'Skipping condominium seeder - not in development environment',
        CondominiumSeeder.name,
      );
      return;
    }

    await this.delay(3000);
    await this.seedCondominiumData();
  }

  private async seedCondominiumData(): Promise<void> {
    try {
      // Check if data already exists
      const existingCondominiums = await this.condominiumRepository.count();

      if (existingCondominiums > 0) {
        this.logger.log(
          `Condominium data already exists (${existingCondominiums} records), skipping seed`,
          CondominiumSeeder.name,
        );
        // Aún así, asegurar que todos los condominios estén asociados al SUPER_ADMIN
        await this.associateAllCondominiumsToSuperAdmin();
        return;
      }

      this.logger.log('Starting condominium demo data seeding...', CondominiumSeeder.name);

      // Create demo condominium
      const condominium = this.condominiumRepository.create({
        name: 'Condominio Las Palmas',
        legalName: 'Condominio Las Palmas SpA',
        rut: '76.123.456-7',
        address: 'Av. Las Condes 12345',
        city: 'Santiago',
        region: 'Región Metropolitana',
        postalCode: '7550000',
        phone: '+56912345678',
        email: 'contacto@laspalmas.cl',
        settings: {
          currency: 'CLP',
          timezone: 'America/Santiago',
          language: 'es',
        },
        isActive: true,
      });

      const savedCondominium = await this.condominiumRepository.save(condominium);

      this.logger.log(
        `Created condominium: ${savedCondominium.name}`,
        CondominiumSeeder.name,
        { condominiumId: savedCondominium.id },
      );

      // Create two buildings
      const buildings = [
        {
          condominiumId: savedCondominium.id,
          name: 'Torre A',
          code: 'TA',
          floors: 5,
          undergroundFloors: 1,
          hasElevator: true,
          address: 'Entrada principal',
          isActive: true,
        },
        {
          condominiumId: savedCondominium.id,
          name: 'Torre B',
          code: 'TB',
          floors: 5,
          undergroundFloors: 1,
          hasElevator: true,
          address: 'Entrada secundaria',
          isActive: true,
        },
      ];

      const savedBuildings: Building[] = [];

      for (const buildingData of buildings) {
        const building = this.buildingRepository.create(buildingData);
        const savedBuilding = await this.buildingRepository.save(building);
        savedBuildings.push(savedBuilding);

        this.logger.log(
          `Created building: ${savedBuilding.name}`,
          CondominiumSeeder.name,
          { buildingId: savedBuilding.id },
        );
      }

      // Create units for each building (5 floors × 2 units per floor = 10 units per building)
      const unitTypes = [UnitType.APARTMENT, UnitType.APARTMENT];
      let totalUnits = 0;

      for (const building of savedBuildings) {
        for (let floor = 1; floor <= 5; floor++) {
          for (let unitNum = 1; unitNum <= 2; unitNum++) {
            const unitNumber = `${floor}0${unitNum}`;
            const unit = this.unitRepository.create({
              buildingId: building.id,
              number: unitNumber,
              floor,
              unitType: unitTypes[(unitNum - 1) % unitTypes.length],
              areaM2: 70 + Math.random() * 30, // Random area between 70-100 m2
              aliquot: 0.025, // 2.5% per unit (40 units = 100%)
              bedrooms: 2 + Math.floor(Math.random() * 2), // 2-3 bedrooms
              bathrooms: 1 + Math.floor(Math.random() * 2), // 1-2 bathrooms
              status: UnitStatus.AVAILABLE,
              isOccupied: false,
            });

            await this.unitRepository.save(unit);
            totalUnits++;
          }
        }
      }

      // Asociar el condominio al usuario SUPER_ADMIN
      await this.associateCondominiumToSuperAdmin(savedCondominium.id);

      this.logger.warn(
        '✅ DEMO DATA CREATED SUCCESSFULLY',
        CondominiumSeeder.name,
        {
          condominium: savedCondominium.name,
          buildings: savedBuildings.length,
          units: totalUnits,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to seed condominium demo data',
        error.stack || error.message,
        CondominiumSeeder.name,
        { error: error.message },
      );
    }
  }

  /**
   * Asocia todos los condominios existentes al usuario SUPER_ADMIN
   */
  private async associateAllCondominiumsToSuperAdmin(): Promise<void> {
    try {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@admin.com';
      const superAdmin = await this.userRepository.findOne({
        where: { email: adminEmail, role: Role.SUPER_ADMIN },
        relations: ['condominios'],
      });

      if (!superAdmin) {
        this.logger.warn(
          'Super admin user not found, skipping condominium association',
          CondominiumSeeder.name,
          { adminEmail },
        );
        return;
      }

      // Obtener todos los condominios activos
      const allCondominiums = await this.condominiumRepository.find({
        where: { isActive: true },
      });

      if (allCondominiums.length === 0) {
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
          CondominiumSeeder.name,
        );
        return;
      }

      // Asociar los condominios faltantes
      if (!superAdmin.condominios) {
        superAdmin.condominios = [];
      }
      superAdmin.condominios.push(...condominiumsToAdd);
      await this.userRepository.save(superAdmin);

      // Invalidar cache del usuario para forzar refresco de condominios
      await this.cache.invalidate(`user:${superAdmin.id}`);
      await this.cache.invalidate(`user:email:${superAdmin.email}`);

      this.logger.log(
        'All condominiums associated to super admin successfully',
        CondominiumSeeder.name,
        {
          userId: superAdmin.id,
          totalCondominiums: allCondominiums.length,
          newlyAssociated: condominiumsToAdd.length,
          condominiumNames: condominiumsToAdd.map((c) => c.name),
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to associate all condominiums to super admin',
        error.stack || error.message,
        CondominiumSeeder.name,
        { error: error.message },
      );
    }
  }

  /**
   * Asocia un condominio al usuario SUPER_ADMIN
   */
  private async associateCondominiumToSuperAdmin(condominiumId: string): Promise<void> {
    try {
      // Buscar el usuario SUPER_ADMIN
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@admin.com';
      const superAdmin = await this.userRepository.findOne({
        where: { email: adminEmail, role: Role.SUPER_ADMIN },
        relations: ['condominios'],
      });

      if (!superAdmin) {
        this.logger.warn(
          'Super admin user not found, skipping condominium association',
          CondominiumSeeder.name,
          { adminEmail },
        );
        return;
      }

      // Verificar si ya está asociado
      const isAlreadyAssociated = superAdmin.condominios?.some(
        (c) => c.id === condominiumId,
      );

      if (isAlreadyAssociated) {
        this.logger.log(
          'Condominium already associated to super admin',
          CondominiumSeeder.name,
          { condominiumId, userId: superAdmin.id },
        );
        return;
      }

      // Obtener el condominio
      const condominium = await this.condominiumRepository.findOne({
        where: { id: condominiumId },
      });

      if (!condominium) {
        this.logger.warn(
          'Condominium not found for association',
          CondominiumSeeder.name,
          { condominiumId },
        );
        return;
      }

      // Asociar el condominio al super admin
      if (!superAdmin.condominios) {
        superAdmin.condominios = [];
      }
      superAdmin.condominios.push(condominium);
      await this.userRepository.save(superAdmin);

      // Invalidar cache del usuario para forzar refresco de condominios
      await this.cache.invalidate(`user:${superAdmin.id}`);
      await this.cache.invalidate(`user:email:${superAdmin.email}`);

      this.logger.log(
        'Condominium associated to super admin successfully',
        CondominiumSeeder.name,
        {
          condominiumId,
          condominiumName: condominium.name,
          userId: superAdmin.id,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to associate condominium to super admin',
        error.stack || error.message,
        CondominiumSeeder.name,
        { error: error.message, condominiumId },
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
