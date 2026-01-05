import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { AdminUserSeeder } from '../database/seeders/admin-user.seeder';
import { CanModifyUserGuard } from '../guards/can-modify-user.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, AdminUserSeeder, CanModifyUserGuard],
  exports: [UsersService],
})
export class UsersModule {}
