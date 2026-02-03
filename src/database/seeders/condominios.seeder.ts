import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Condominio } from '../../condominios/entities/condominio.entity';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class CondominiosSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const condominiosRepository = dataSource.getRepository(Condominio);
    const usersRepository = dataSource.getRepository(User);

    // Verificar si ya existen condominios
    const existingCondominios = await condominiosRepository.count();
    if (existingCondominios > 0) {
      console.log('Condominios already exist, skipping seed');
      return;
    }

    // Crear Condominio 1: Torres del Sol
    const condominio1 = condominiosRepository.create({
      name: 'Torres del Sol',
      description: 'Condominio residencial de lujo con vista al mar',
      address: 'Av. Costanera 1234',
      city: 'Viña del Mar',
      country: 'Chile',
      postalCode: '2520000',
      phone: '+56322123456',
      email: 'contacto@torresdelsol.cl',
      website: 'www.torresdelsol.cl',
      taxId: '76.123.456-7',
      isActive: true,
    });
    await condominiosRepository.save(condominio1);

    // Crear Condominio 2: Jardines del Este
    const condominio2 = condominiosRepository.create({
      name: 'Jardines del Este',
      description: 'Condominio familiar con amplias áreas verdes',
      address: 'Av. Las Condes 5678',
      city: 'Santiago',
      country: 'Chile',
      postalCode: '7550000',
      phone: '+56223334444',
      email: 'info@jardinesdeleste.cl',
      website: 'www.jardinesdeleste.cl',
      taxId: '76.789.012-3',
      isActive: true,
    });
    await condominiosRepository.save(condominio2);

    // Crear admin que gestiona solo Condominio 1
    const admin1 = usersRepository.create({
      email: 'admin@torresdelsol.cl',
      password: 'Admin123!',
      firstName: 'Carlos',
      lastName: 'Administrador',
      role: Role.ADMIN,
      isActive: true,
      condominios: [condominio1],
    });
    await usersRepository.save(admin1);

    // Crear admin que gestiona solo Condominio 2
    const admin2 = usersRepository.create({
      email: 'admin@jardinesdeleste.cl',
      password: 'Admin123!',
      firstName: 'María',
      lastName: 'Gestora',
      role: Role.ADMIN,
      isActive: true,
      condominios: [condominio2],
    });
    await usersRepository.save(admin2);

    // Crear super admin que gestiona AMBOS condominios
    const superAdmin = usersRepository.create({
      email: 'superadmin@condominios.cl',
      password: 'Admin123!',
      firstName: 'Juan',
      lastName: 'Super Administrador',
      role: Role.SUPER_ADMIN,
      isActive: true,
      condominios: [condominio1, condominio2],
    });
    await usersRepository.save(superAdmin);

    console.log('✅ Condominios seeded successfully:');
    console.log(`  - ${condominio1.name} (ID: ${condominio1.id})`);
    console.log(`    Admin: ${admin1.email} / Admin123!`);
    console.log(`  - ${condominio2.name} (ID: ${condominio2.id})`);
    console.log(`    Admin: ${admin2.email} / Admin123!`);
    console.log(`  - Super Admin (gestiona ambos condominios):`);
    console.log(`    Email: ${superAdmin.email} / Admin123!`);
  }
}
