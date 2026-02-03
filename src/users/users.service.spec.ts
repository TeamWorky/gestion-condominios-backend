import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { LoggerService } from '../logger/logger.service';
import { RedisCacheService } from '../redis/redis-cache.service';
import {
  NotFoundException,
  AlreadyExistsException,
} from '../common/exceptions/business.exception';
import { Role, RoleHierarchy } from '../common/enums/role.enum';
import { SoftDeleteRepositoryHelper } from '../common/repositories/base.repository';

// Mock SoftDeleteRepositoryHelper
jest.mock('../common/repositories/base.repository');

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;
  let cache: jest.Mocked<RedisCacheService>;
  let logger: jest.Mocked<LoggerService>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    withDeleted: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    softRemove: jest.fn(),
    remove: jest.fn(),
    recover: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    invalidate: jest.fn(),
    invalidatePattern: jest.fn(),
    getOrSet: jest.fn(async (key, fn) => {
      return await fn();
    }),
  };

  const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    logWithMetadata: jest.fn(),
  };

  // Helper para crear usuario mock
  const createMockUser = (overrides?: Partial<User>): User => {
    const user = new User();
    user.id = overrides?.id || '123e4567-e89b-12d3-a456-426614174000';
    user.email = overrides?.email || 'test@example.com';
    user.password = overrides?.password || '$2b$10$hashedpassword';
    user.firstName = overrides?.firstName || 'Test';
    user.lastName = overrides?.lastName || 'User';
    user.role = overrides?.role || Role.USER;
    user.isActive =
      overrides?.isActive !== undefined ? overrides.isActive : true;
    user.refreshToken = overrides?.refreshToken || null;
    user.createdAt = overrides?.createdAt || new Date();
    user.updatedAt = overrides?.updatedAt || new Date();
    user.deletedAt = overrides?.deletedAt || undefined;
    return Object.assign(user, overrides);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: RedisCacheService,
          useValue: mockCache,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
    cache = module.get(RedisCacheService);
    logger = module.get(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        firstName: 'New',
        lastName: 'User',
      };
      const mockUser = createMockUser(createUserDto);

      (SoftDeleteRepositoryHelper.findOneBy as jest.Mock).mockResolvedValue(
        null,
      );
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);
      cache.invalidatePattern.mockResolvedValue(undefined);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(cache.invalidatePattern).toHaveBeenCalled();
    });

    it('should throw AlreadyExistsException when email already exists', async () => {
      // Arrange
      const createUserDto = {
        email: 'existing@example.com',
        password: 'SecurePassword123!',
        firstName: 'Existing',
        lastName: 'User',
      };
      const existingUser = createMockUser({ email: createUserDto.email });

      (SoftDeleteRepositoryHelper.findOneBy as jest.Mock).mockResolvedValue(
        existingUser,
      );
      (SoftDeleteRepositoryHelper.isDeleted as jest.Mock).mockReturnValue(
        false,
      );

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(
        AlreadyExistsException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should restore user when email exists but user is deleted', async () => {
      // Arrange
      const createUserDto = {
        email: 'deleted@example.com',
        password: 'NewPassword123!',
        firstName: 'Restored',
        lastName: 'User',
      };
      const deletedUser = createMockUser({
        email: createUserDto.email,
        deletedAt: new Date(),
      });
      const restoredUser = createMockUser(createUserDto);

      (SoftDeleteRepositoryHelper.findOneBy as jest.Mock).mockResolvedValue(
        deletedUser,
      );
      (SoftDeleteRepositoryHelper.isDeleted as jest.Mock).mockReturnValue(true);
      (SoftDeleteRepositoryHelper.restoreEntity as jest.Mock).mockResolvedValue(
        deletedUser,
      );
      repository.save.mockResolvedValue(restoredUser);
      cache.invalidate.mockResolvedValue(undefined);
      cache.invalidatePattern.mockResolvedValue(undefined);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(SoftDeleteRepositoryHelper.restoreEntity).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(restoredUser);
    });
  });

  describe('findOne', () => {
    it('should return user from cache if available', async () => {
      // Arrange
      const userId = 'user-id-123';
      const mockUser = createMockUser({ id: userId });
      const cachedUser = { ...mockUser };

      cache.getOrSet.mockResolvedValue(cachedUser);

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(result).toEqual(cachedUser);
      expect(cache.getOrSet).toHaveBeenCalled();
    });

    it('should fetch user from database and cache it when not in cache', async () => {
      // Arrange
      const userId = 'user-id-123';
      const mockUser = createMockUser({ id: userId });

      cache.getOrSet.mockImplementation(async (key, fn) => {
        return await fn();
      });
      (SoftDeleteRepositoryHelper.findOneById as jest.Mock).mockResolvedValue(
        mockUser,
      );

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(SoftDeleteRepositoryHelper.findOneById).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-id';

      cache.getOrSet.mockImplementation(async (key, fn) => {
        return await fn();
      });
      (SoftDeleteRepositoryHelper.findOneById as jest.Mock).mockResolvedValue(
        null,
      );

      // Act & Assert
      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });

    it('should not use cache when includeDeleted is true', async () => {
      // Arrange
      const userId = 'user-id-123';
      const mockUser = createMockUser({ id: userId, deletedAt: new Date() });

      (SoftDeleteRepositoryHelper.findOneById as jest.Mock).mockResolvedValue(
        mockUser,
      );

      // Act
      const result = await service.findOne(userId, true);

      // Assert
      expect(result).toEqual(mockUser);
      expect(cache.getOrSet).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return user from cache if available', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser = createMockUser({ email });

      cache.getOrSet.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should fetch user from database when not in cache', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser = createMockUser({ email });

      cache.getOrSet.mockImplementation(async (key, fn) => {
        return await fn();
      });
      (SoftDeleteRepositoryHelper.findOneBy as jest.Mock).mockResolvedValue(
        mockUser,
      );

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      const email = 'nonexistent@example.com';

      cache.getOrSet.mockImplementation(async (key, fn) => {
        return await fn();
      });
      (SoftDeleteRepositoryHelper.findOneBy as jest.Mock).mockResolvedValue(
        null,
      );

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return paginated users with caching', async () => {
      // Arrange
      const pagination = { page: 1, limit: 10 };
      const users = [createMockUser(), createMockUser()];
      const total = 2;

      cache.getOrSet.mockImplementation(async (key, fn) => {
        return await fn();
      });
      (SoftDeleteRepositoryHelper.findAll as jest.Mock).mockResolvedValue([
        users,
        total,
      ]);

      // Act
      const result = await service.findAll(pagination);

      // Assert
      expect(result.data).toEqual(users);
      expect(result.total).toBe(total);
      expect(cache.getOrSet).toHaveBeenCalled();
    });

    it('should handle pagination correctly', async () => {
      // Arrange
      const pagination = { page: 2, limit: 5 };
      const users = [createMockUser()];
      const total = 10;

      cache.getOrSet.mockImplementation(async (key, fn) => {
        return await fn();
      });
      (SoftDeleteRepositoryHelper.findAll as jest.Mock).mockResolvedValue([
        users,
        total,
      ]);

      // Act
      const result = await service.findAll(pagination);

      // Assert
      expect(result.data).toEqual(users);
      expect(result.total).toBe(total);
      expect(SoftDeleteRepositoryHelper.findAll).toHaveBeenCalledWith(
        repository,
        expect.objectContaining({
          skip: 5, // (page - 1) * limit = (2 - 1) * 5 = 5
          take: 5,
        }),
      );
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 'user-id-123';
      const updateDto = { firstName: 'Updated' };
      const existingUser = createMockUser({ id: userId });
      const updatedUser = createMockUser({ ...existingUser, ...updateDto });

      jest.spyOn(service, 'findOne').mockResolvedValue(existingUser);
      repository.save.mockResolvedValue(updatedUser);
      cache.invalidate.mockResolvedValue(undefined);
      cache.invalidatePattern.mockResolvedValue(undefined);

      // Act
      const result = await service.update(userId, updateDto);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when trying to assign SUPER_ADMIN role as non-SUPER_ADMIN', async () => {
      // Arrange
      const userId = 'user-id-123';
      const updateDto = { role: Role.SUPER_ADMIN };
      const existingUser = createMockUser({ id: userId, role: Role.ADMIN });

      jest.spyOn(service, 'findOne').mockResolvedValue(existingUser);

      // Act & Assert
      await expect(
        service.update(userId, updateDto, Role.ADMIN),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when trying to assign role equal or higher than own', async () => {
      // Arrange
      const userId = 'user-id-123';
      const updateDto = { role: Role.ADMIN };
      const existingUser = createMockUser({ id: userId, role: Role.USER });

      jest.spyOn(service, 'findOne').mockResolvedValue(existingUser);

      // Act & Assert
      await expect(
        service.update(userId, updateDto, Role.USER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow SUPER_ADMIN to assign any role', async () => {
      // Arrange
      const userId = 'user-id-123';
      const updateDto = { role: Role.SUPER_ADMIN };
      const existingUser = createMockUser({ id: userId, role: Role.USER });
      const updatedUser = createMockUser({
        ...existingUser,
        role: Role.SUPER_ADMIN,
      });

      jest.spyOn(service, 'findOne').mockResolvedValue(existingUser);
      repository.save.mockResolvedValue(updatedUser);
      cache.invalidate.mockResolvedValue(undefined);
      cache.invalidatePattern.mockResolvedValue(undefined);

      // Act
      const result = await service.update(userId, updateDto, Role.SUPER_ADMIN);

      // Assert
      expect(result.role).toBe(Role.SUPER_ADMIN);
    });
  });

  describe('remove', () => {
    it('should soft delete user successfully', async () => {
      // Arrange
      const userId = 'user-id-123';
      const mockUser = createMockUser({ id: userId });

      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);
      (
        SoftDeleteRepositoryHelper.softDeleteEntity as jest.Mock
      ).mockResolvedValue(mockUser);
      cache.invalidate.mockResolvedValue(undefined);
      cache.invalidatePattern.mockResolvedValue(undefined);

      // Act
      await service.remove(userId);

      // Assert
      expect(SoftDeleteRepositoryHelper.softDeleteEntity).toHaveBeenCalledWith(
        repository,
        mockUser,
      );
      expect(logger.log).toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore soft deleted user', async () => {
      // Arrange
      const userId = 'user-id-123';
      const deletedUser = createMockUser({
        id: userId,
        deletedAt: new Date(),
      });
      const restoredUser = createMockUser({ id: userId });

      jest.spyOn(service, 'findOne').mockResolvedValue(deletedUser);
      (SoftDeleteRepositoryHelper.isDeleted as jest.Mock).mockReturnValue(true);
      (SoftDeleteRepositoryHelper.restoreEntity as jest.Mock).mockResolvedValue(
        restoredUser,
      );
      cache.invalidate.mockResolvedValue(undefined);
      cache.invalidatePattern.mockResolvedValue(undefined);

      // Act
      const result = await service.restore(userId);

      // Assert
      expect(result).toEqual(restoredUser);
      expect(SoftDeleteRepositoryHelper.restoreEntity).toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user is not deleted', async () => {
      // Arrange
      const userId = 'user-id-123';
      const activeUser = createMockUser({ id: userId });

      jest.spyOn(service, 'findOne').mockResolvedValue(activeUser);
      (SoftDeleteRepositoryHelper.isDeleted as jest.Mock).mockReturnValue(
        false,
      );

      // Act & Assert
      await expect(service.restore(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete user', async () => {
      // Arrange
      const userId = 'user-id-123';
      const mockUser = createMockUser({ id: userId });

      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);
      (
        SoftDeleteRepositoryHelper.hardDeleteEntity as jest.Mock
      ).mockResolvedValue(undefined);
      cache.invalidate.mockResolvedValue(undefined);
      cache.invalidatePattern.mockResolvedValue(undefined);

      // Act
      await service.hardDelete(userId);

      // Assert
      expect(SoftDeleteRepositoryHelper.hardDeleteEntity).toHaveBeenCalledWith(
        repository,
        mockUser,
      );
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token and invalidate cache', async () => {
      // Arrange
      const userId = 'user-id-123';
      const refreshToken = 'new-refresh-token';

      repository.update.mockResolvedValue(undefined);
      cache.invalidate.mockResolvedValue(undefined);

      // Act
      await service.updateRefreshToken(userId, refreshToken);

      // Assert
      expect(repository.update).toHaveBeenCalledWith(userId, {
        refreshToken,
      });
      expect(cache.invalidate).toHaveBeenCalled();
    });

    it('should set refresh token to undefined when null is provided', async () => {
      // Arrange
      const userId = 'user-id-123';

      repository.update.mockResolvedValue(undefined);
      cache.invalidate.mockResolvedValue(undefined);

      // Act
      await service.updateRefreshToken(userId, null);

      // Assert
      expect(repository.update).toHaveBeenCalledWith(userId, {
        refreshToken: undefined,
      });
    });
  });

  describe('findDeleted', () => {
    it('should return paginated deleted users', async () => {
      // Arrange
      const pagination = { page: 1, limit: 10 };
      const deletedUsers = [
        createMockUser({ id: '1', deletedAt: new Date() }),
        createMockUser({ id: '2', deletedAt: new Date() }),
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([deletedUsers, 2]);

      // Act
      const result = await service.findDeleted(pagination);

      // Assert
      expect(result.data).toEqual(deletedUsers);
      expect(result.total).toBe(2);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.deletedAt IS NOT NULL',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should handle pagination for deleted users', async () => {
      // Arrange
      const pagination = { page: 2, limit: 5 };
      const paginatedDeleted = Array.from({ length: 5 }, (_, i) =>
        createMockUser({ id: `${i + 5}`, deletedAt: new Date() }),
      );

      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        paginatedDeleted,
        10,
      ]);

      // Act
      const result = await service.findDeleted(pagination);

      // Assert
      expect(result.data.length).toBe(5);
      expect(result.total).toBe(10);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5); // (page - 1) * limit
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });
  });
});
