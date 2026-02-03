import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from './entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { ResponseUtil } from '../utils/response.util';
import { SUCCESS_MESSAGES } from '../common/constants/app.constants';
import {
  AlreadyExistsException,
  NotFoundException,
} from '../common/exceptions/business.exception';
import { ForbiddenException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
    hardDelete: jest.fn(),
    findDeleted: jest.fn(),
  };

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
    return Object.assign(user, overrides);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        firstName: 'New',
        lastName: 'User',
      };

      const createdUser = createMockUser(createUserDto);
      service.create.mockResolvedValue(createdUser);

      // Act
      const result = await controller.create(createUserDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(
        ResponseUtil.success(
          expect.objectContaining({
            id: createdUser.id,
            email: createdUser.email,
            firstName: createdUser.firstName,
            lastName: createdUser.lastName,
          }),
          SUCCESS_MESSAGES.CREATED,
        ),
      );
      expect(result.data).not.toHaveProperty('password');
      expect(result.data).not.toHaveProperty('refreshToken');
    });

    it('should throw AlreadyExistsException when email already exists', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'SecurePassword123!',
        firstName: 'Existing',
        lastName: 'User',
      };

      service.create.mockRejectedValue(new AlreadyExistsException('Email'));

      // Act & Assert
      await expect(controller.create(createUserDto)).rejects.toThrow(
        AlreadyExistsException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      // Arrange
      const pagination: PaginationDto = { page: 1, limit: 10 };
      const users = [createMockUser(), createMockUser()];
      const total = 2;

      service.findAll.mockResolvedValue({ data: users, total });

      // Act
      const result = await controller.findAll(pagination);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(pagination);
      expect(result).toEqual(ResponseUtil.paginated(users, 1, 10, total));
    });

    it('should use default pagination when not provided', async () => {
      // Arrange
      const pagination: PaginationDto = {};
      const users = [createMockUser()];
      const total = 1;

      service.findAll.mockResolvedValue({ data: users, total });

      // Act
      const result = await controller.findAll(pagination);

      // Assert
      expect(result).toEqual(ResponseUtil.paginated(users, 1, 10, total));
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      // Arrange
      const userId = 'user-id-123';
      const user = createMockUser({ id: userId });

      service.findOne.mockResolvedValue(user);

      // Act
      const result = await controller.findOne(userId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(ResponseUtil.success(user));
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-id';

      service.findOne.mockRejectedValue(new NotFoundException('User'));

      // Act & Assert
      await expect(controller.findOne(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 'user-id-123';
      const updateDto: UpdateUserDto = { firstName: 'Updated' };
      const currentUser = { id: userId, role: Role.ADMIN };
      const updatedUser = createMockUser({
        id: userId,
        firstName: 'Updated',
      });

      service.update.mockResolvedValue(updatedUser);

      // Act
      const result = await controller.update(
        userId,
        updateDto,
        currentUser as any,
      );

      // Assert
      expect(service.update).toHaveBeenCalledWith(
        userId,
        updateDto,
        currentUser.role,
      );
      expect(result).toEqual(
        ResponseUtil.success(
          expect.objectContaining({
            firstName: 'Updated',
          }),
          SUCCESS_MESSAGES.UPDATED,
        ),
      );
      expect(result.data).not.toHaveProperty('password');
      expect(result.data).not.toHaveProperty('refreshToken');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-id';
      const updateDto: UpdateUserDto = { firstName: 'Updated' };
      const currentUser = { id: userId, role: Role.ADMIN };

      service.update.mockRejectedValue(new NotFoundException('User'));

      // Act & Assert
      await expect(
        controller.update(userId, updateDto, currentUser as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user cannot modify target', async () => {
      // Arrange
      const userId = 'user-id-123';
      const updateDto: UpdateUserDto = { role: Role.ADMIN };
      const currentUser = { id: 'other-id', role: Role.USER };

      service.update.mockRejectedValue(
        new ForbiddenException('Cannot modify users with higher roles'),
      );

      // Act & Assert
      await expect(
        controller.update(userId, updateDto, currentUser as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should soft delete user successfully', async () => {
      // Arrange
      const userId = 'user-id-123';

      service.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(userId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(userId);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-id';

      service.remove.mockRejectedValue(new NotFoundException('User'));

      // Act & Assert
      await expect(controller.remove(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore soft deleted user successfully', async () => {
      // Arrange
      const userId = 'user-id-123';
      const restoredUser = createMockUser({ id: userId });

      service.restore.mockResolvedValue(restoredUser);

      // Act
      const result = await controller.restore(userId);

      // Assert
      expect(service.restore).toHaveBeenCalledWith(userId);
      expect(result).toEqual(
        ResponseUtil.success(
          expect.objectContaining({
            id: userId,
          }),
          'User restored successfully',
        ),
      );
      expect(result.data).not.toHaveProperty('password');
      expect(result.data).not.toHaveProperty('refreshToken');
    });

    it('should throw NotFoundException when user is not deleted', async () => {
      // Arrange
      const userId = 'user-id-123';

      service.restore.mockRejectedValue(
        new NotFoundException('User not found or not deleted'),
      );

      // Act & Assert
      await expect(controller.restore(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete user', async () => {
      // Arrange
      const userId = 'user-id-123';

      service.hardDelete.mockResolvedValue(undefined);

      // Act
      const result = await controller.hardDelete(userId);

      // Assert
      expect(service.hardDelete).toHaveBeenCalledWith(userId);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-id';

      service.hardDelete.mockRejectedValue(new NotFoundException('User'));

      // Act & Assert
      await expect(controller.hardDelete(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findDeleted', () => {
    it('should return paginated deleted users', async () => {
      // Arrange
      const pagination: PaginationDto = { page: 1, limit: 10 };
      const deletedUsers = [
        createMockUser({ id: '1', deletedAt: new Date() }),
        createMockUser({ id: '2', deletedAt: new Date() }),
      ];
      const total = 2;

      service.findDeleted.mockResolvedValue({ data: deletedUsers, total });

      // Act
      const result = await controller.findDeleted(pagination);

      // Assert
      expect(service.findDeleted).toHaveBeenCalledWith(pagination);
      expect(result).toEqual(
        ResponseUtil.paginated(deletedUsers, 1, 10, total),
      );
    });

    it('should use default pagination when not provided', async () => {
      // Arrange
      const pagination: PaginationDto = {};
      const deletedUsers = [createMockUser({ deletedAt: new Date() })];
      const total = 1;

      service.findDeleted.mockResolvedValue({ data: deletedUsers, total });

      // Act
      const result = await controller.findDeleted(pagination);

      // Assert
      expect(result).toEqual(
        ResponseUtil.paginated(deletedUsers, 1, 10, total),
      );
    });
  });
});
