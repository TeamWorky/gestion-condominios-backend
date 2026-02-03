import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import {
  AlreadyExistsException,
  UnauthorizedException,
} from '../common/exceptions/business.exception';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  // Mocks de los servicios
  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    updateRefreshToken: jest.fn(),
    findOne: jest.fn(),
    findOneWithCondominios: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret-minimum-32-characters-long';
      if (key === 'JWT_REFRESH_SECRET')
        return 'test-refresh-secret-minimum-32-characters-long';
      return null;
    }),
  };

  // Helper para crear un usuario mock
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
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.validatePassword = jest.fn().mockResolvedValue(true);
    return Object.assign(user, overrides);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange (Preparar)
      const registerDto = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        firstName: 'New',
        lastName: 'User',
      };
      const mockUser = createMockUser({
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });

      // Configurar los mocks
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockedBcrypt.hash.mockResolvedValue('hashed-refresh-token');
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      // Act (Ejecutar)
      const result = await service.register(registerDto);

      // Assert (Verificar)
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'hashed-refresh-token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('refreshToken');
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...registerDto,
        role: undefined,
      });
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        'hashed-refresh-token',
      );
    });

    it('should throw AlreadyExistsException when email already exists', async () => {
      // Arrange
      const registerDto = {
        email: 'existing@example.com',
        password: 'SecurePassword123!',
        firstName: 'Existing',
        lastName: 'User',
      };
      const existingUser = createMockUser({ email: registerDto.email });

      mockUsersService.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        AlreadyExistsException,
      );
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      };
      const mockUser = createMockUser({
        email: loginDto.email,
        isActive: true,
      });
      mockUser.validatePassword = jest.fn().mockResolvedValue(true);
      const mockUserWithCondominios = {
        ...mockUser,
        condominios: [],
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.findOneWithCondominios.mockResolvedValue(
        mockUserWithCondominios,
      );
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockedBcrypt.hash.mockResolvedValue('hashed-refresh-token');
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('condominios');
      expect(mockUser.validatePassword).toHaveBeenCalledWith(loginDto.password);
      expect(mockUsersService.findOneWithCondominios).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      // Arrange
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'SecurePassword123!',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.updateRefreshToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      // Arrange
      const loginDto = {
        email: 'inactive@example.com',
        password: 'SecurePassword123!',
      };
      const mockUser = createMockUser({
        email: loginDto.email,
        isActive: false,
      });

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUser.validatePassword).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };
      const mockUser = createMockUser({
        email: loginDto.email,
        isActive: true,
      });
      mockUser.validatePassword = jest.fn().mockResolvedValue(false);

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUser.validatePassword).toHaveBeenCalledWith(loginDto.password);
    });
  });

  describe('logout', () => {
    it('should invalidate refresh token on logout', async () => {
      // Arrange
      const userId = 'user-id-123';
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      // Act
      await service.logout(userId);

      // Assert
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        userId,
        null,
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      // Arrange
      const userId = 'user-id-123';
      const refreshToken = 'valid-refresh-token';
      const mockUser = createMockUser({
        id: userId,
        refreshToken: 'hashed-refresh-token',
      });

      // Clear previous mocks
      mockJwtService.signAsync.mockClear();
      mockedBcrypt.hash.mockClear();

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      mockedBcrypt.hash.mockResolvedValue('new-hashed-refresh-token' as never);
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      // Act
      const result = await service.refreshTokens(userId, refreshToken);

      // Assert
      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-hashed-refresh-token');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        refreshToken,
        mockUser.refreshToken,
      );
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        userId,
        'new-hashed-refresh-token',
      );
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-id';
      const refreshToken = 'refresh-token';

      mockUsersService.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user has no refresh token', async () => {
      // Arrange
      const userId = 'user-id-123';
      const refreshToken = 'refresh-token';
      const mockUser = createMockUser({
        id: userId,
        refreshToken: null,
      });

      mockUsersService.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      // Arrange
      const userId = 'user-id-123';
      const refreshToken = 'invalid-refresh-token';
      const mockUser = createMockUser({
        id: userId,
        refreshToken: 'hashed-refresh-token',
      });

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUsersService.updateRefreshToken).not.toHaveBeenCalled();
    });
  });
});
