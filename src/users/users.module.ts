import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Condominium } from '../condominiums/entities/condominium.entity';
import { AdminUserSeeder } from '../database/seeders/admin-user.seeder';
import { CanModifyUserGuard } from '../guards/can-modify-user.guard';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Condominium]), RedisModule],
  controllers: [UsersController],
  providers: [UsersService, AdminUserSeeder, CanModifyUserGuard],
  exports: [UsersService],
})
export class UsersModule {}
