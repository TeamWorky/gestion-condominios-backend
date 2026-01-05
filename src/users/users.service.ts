import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AlreadyExistsException, NotFoundException } from '../common/exceptions/business.exception';
import { Role, RoleHierarchy } from '../common/enums/role.enum';
import { SoftDeleteRepositoryHelper } from '../common/repositories/base.repository';
import { LoggerService } from '../logger/logger.service';
import { RedisCacheService } from '../redis/redis-cache.service';

/**
 * Cache TTL constants (in seconds)
 */
const CACHE_TTL = {
  USER: 300, // 5 minutes for single user
  USER_LIST: 60, // 1 minute for user lists (more dynamic)
  USER_BY_EMAIL: 300, // 5 minutes for user by email
};

/**
 * Cache key patterns
 */
const CACHE_KEYS = {
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  userList: (page: number, limit: number, includeDeleted: boolean) =>
    `users:list:${page}:${limit}:${includeDeleted}`,
  userListPattern: () => 'users:list:*',
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    private readonly logger: LoggerService,
    private readonly cache: RedisCacheService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await SoftDeleteRepositoryHelper.findOneBy(
      this._userRepository,
      { email: createUserDto.email },
      { includeDeleted: true },
    );

    if (existingUser && !SoftDeleteRepositoryHelper.isDeleted(existingUser)) {
      throw new AlreadyExistsException('Email');
    }

    // If user exists but is deleted, restore it instead of creating new
    if (existingUser && SoftDeleteRepositoryHelper.isDeleted(existingUser)) {
      this.logger.warn(
        `Attempting to create user with deleted email: ${createUserDto.email}. Restoring instead.`,
        UsersService.name,
        { email: createUserDto.email },
      );
      const restoredUser = await SoftDeleteRepositoryHelper.restoreEntity(
        this._userRepository,
        existingUser,
      );
      Object.assign(restoredUser, createUserDto);
      const savedUser = await this._userRepository.save(restoredUser);

      // Invalidate cache
      await this.invalidateUserCache(savedUser.id, savedUser.email);

      return savedUser;
    }

    const user = this._userRepository.create(createUserDto);
    const savedUser = await this._userRepository.save(user);

    // Invalidate user list cache (new user added)
    await this.cache.invalidatePattern(CACHE_KEYS.userListPattern());

    return savedUser;
  }

  async findAll(pagination: PaginationDto): Promise<{ data: User[]; total: number }> {
    const { page = 1, limit = 10, includeDeleted = false } = pagination;
    const cacheKey = CACHE_KEYS.userList(page, limit, includeDeleted);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const [data, total] = await SoftDeleteRepositoryHelper.findAll(
          this._userRepository,
          {
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
            select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt', 'deletedAt'],
            includeDeleted,
          },
        );

        return { data, total };
      },
      CACHE_TTL.USER_LIST,
    );
  }

  async findOne(id: string, includeDeleted = false): Promise<User> {
    // Don't cache when including deleted (different data)
    if (includeDeleted) {
      const foundUser = await SoftDeleteRepositoryHelper.findOneById(
        this._userRepository,
        id,
        {
          select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt', 'deletedAt'],
          includeDeleted,
        },
      );

      if (!foundUser) {
        throw new NotFoundException('User');
      }

      return foundUser;
    }

    // Cache for normal queries (exclude deleted)
    const cacheKey = CACHE_KEYS.user(id);

    const user = await this.cache.getOrSet(
      cacheKey,
      async () => {
        const foundUser = await SoftDeleteRepositoryHelper.findOneById(
          this._userRepository,
          id,
          {
            select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt', 'deletedAt'],
            includeDeleted: false,
          },
        );

        if (!foundUser) {
          throw new NotFoundException('User');
        }

        return foundUser;
      },
      CACHE_TTL.USER,
    );

    return user;
  }

  async findByEmail(email: string, includeDeleted = false): Promise<User | null> {
    const cacheKey = CACHE_KEYS.userByEmail(email);

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        return await SoftDeleteRepositoryHelper.findOneBy(
          this._userRepository,
          { email },
          { includeDeleted },
        );
      },
      CACHE_TTL.USER_BY_EMAIL,
    );
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUserRole?: Role): Promise<User> {
    const user = await this.findOne(id);

    // Prevent role escalation - users cannot assign themselves higher roles
    if (updateUserDto.role && currentUserRole) {
      const currentRoleLevel = RoleHierarchy[currentUserRole];
      const newRoleLevel = RoleHierarchy[updateUserDto.role];

      // Only SUPER_ADMIN can assign SUPER_ADMIN role
      if (updateUserDto.role === Role.SUPER_ADMIN && currentUserRole !== Role.SUPER_ADMIN) {
        throw new ForbiddenException('Only SUPER_ADMIN can assign SUPER_ADMIN role');
      }

      // Cannot assign a role higher than your own
      if (newRoleLevel >= currentRoleLevel && currentUserRole !== Role.SUPER_ADMIN) {
        throw new ForbiddenException('You cannot assign a role equal to or higher than your own');
      }
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this._userRepository.save(user);

    // Invalidate cache
    await this.invalidateUserCache(updatedUser.id, updatedUser.email);

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await SoftDeleteRepositoryHelper.softDeleteEntity(this._userRepository, user);

    // Invalidate cache
    await this.invalidateUserCache(user.id, user.email);

    this.logger.log(`User soft deleted: ${id}`, UsersService.name, { userId: id });
  }

  /**
   * Restore a soft deleted user
   */
  async restore(id: string): Promise<User> {
    const user = await this.findOne(id, true);

    if (!SoftDeleteRepositoryHelper.isDeleted(user)) {
      throw new NotFoundException('User is not deleted');
    }

    const restoredUser = await SoftDeleteRepositoryHelper.restoreEntity(
      this._userRepository,
      user,
    );

    // Invalidate cache
    await this.invalidateUserCache(restoredUser.id, restoredUser.email);

    this.logger.log(`User restored: ${id}`, UsersService.name, { userId: id });

    return restoredUser;
  }

  /**
   * Permanently delete a user (hard delete)
   */
  async hardDelete(id: string): Promise<void> {
    const user = await this.findOne(id, true);
    
    // Invalidate cache before deletion
    await this.invalidateUserCache(user.id, user.email);
    
    await SoftDeleteRepositoryHelper.hardDeleteEntity(this._userRepository, user);
    this.logger.warn(`User permanently deleted: ${id}`, UsersService.name, { userId: id });
  }

  /**
   * Find only soft deleted users
   */
  async findDeleted(pagination: PaginationDto): Promise<{ data: User[]; total: number }> {
    const { page = 1, limit = 10 } = pagination;

    // Use query builder for efficient pagination at database level
    const queryBuilder = this._userRepository
      .createQueryBuilder('user')
      .where('user.deletedAt IS NOT NULL')
      .withDeleted()
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.role',
        'user.isActive',
        'user.createdAt',
        'user.updatedAt',
        'user.deletedAt',
      ])
      .orderBy('user.deletedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this._userRepository.update(userId, { 
      refreshToken: refreshToken ?? undefined 
    });

    // Invalidate user cache when refresh token changes
    await this.cache.invalidate(CACHE_KEYS.user(userId));
  }

  /**
   * Invalidate all cache entries for a user
   */
  private async invalidateUserCache(userId: string, email: string): Promise<void> {
    await Promise.all([
      this.cache.invalidate(CACHE_KEYS.user(userId)),
      this.cache.invalidate(CACHE_KEYS.userByEmail(email)),
      this.cache.invalidatePattern(CACHE_KEYS.userListPattern()),
    ]);
  }
}
