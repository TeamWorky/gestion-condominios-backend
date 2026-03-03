import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SelectCondominioDto } from './dto/select-condominio.dto';
import {
  AlreadyExistsException,
  UnauthorizedException,
} from '../common/exceptions/business.exception';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    selectCondominio: jest.fn(),
    logout: jest.fn(),
    refreshTokens: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        firstName: 'New',
        lastName: 'User',
      };

      const registerResult = {
        user: {
          id: 'user-id-123',
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      service.register.mockResolvedValue(registerResult);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(registerResult);
    });

    it('should throw AlreadyExistsException when email already exists', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'SecurePassword123!',
        firstName: 'Existing',
        lastName: 'User',
      };

      service.register.mockRejectedValue(new AlreadyExistsException('Email'));

      // Act & Assert
      await expect(controller.register(registerDto)).rejects.toThrow(
        AlreadyExistsException,
      );
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
      };

      const loginResult = {
        user: {
          id: 'user-id-123',
          email: loginDto.email,
          firstName: 'Test',
          lastName: 'User',
        },
        condominios: [],
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      service.login.mockResolvedValue(loginResult);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(loginResult);
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'WrongPassword',
      };

      service.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      // Act & Assert
      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('selectCondominio', () => {
    it('should select condominio successfully', async () => {
      // Arrange
      const selectCondominioDto: SelectCondominioDto = {
        condominioId: 'condominio-id-123',
      };

      const currentUser = {
        sub: 'user-id-123',
        email: 'user@example.com',
      };

      const tokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      service.selectCondominio.mockResolvedValue(tokens);

      // Act
      const result = await controller.selectCondominio(
        currentUser as any,
        selectCondominioDto,
      );

      // Assert
      expect(service.selectCondominio).toHaveBeenCalledWith(
        currentUser.sub,
        selectCondominioDto.condominioId,
      );
      expect(result).toEqual(tokens);
    });

    it('should throw UnauthorizedException when user has no access to condominio', async () => {
      // Arrange
      const selectCondominioDto: SelectCondominioDto = {
        condominioId: 'unauthorized-condominio-id',
      };

      const currentUser = {
        sub: 'user-id-123',
        email: 'user@example.com',
      };

      service.selectCondominio.mockRejectedValue(
        new UnauthorizedException(
          'User does not have access to this condominio',
        ),
      );

      // Act & Assert
      await expect(
        controller.selectCondominio(currentUser as any, selectCondominioDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Arrange
      const currentUser = {
        sub: 'user-id-123',
        email: 'user@example.com',
      };

      service.logout.mockResolvedValue(undefined);

      // Act
      const result = await controller.logout(currentUser as any);

      // Assert
      expect(service.logout).toHaveBeenCalledWith(currentUser.sub);
      expect(result).toEqual({ message: 'Logout successful' });
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      // Arrange
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const currentUser = {
        sub: 'user-id-123',
        email: 'user@example.com',
      };

      const tokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      service.refreshTokens.mockResolvedValue(tokens);

      // Act
      const result = await controller.refreshTokens(
        refreshTokenDto,
        currentUser as any,
      );

      // Assert
      expect(service.refreshTokens).toHaveBeenCalledWith(
        currentUser.sub,
        refreshTokenDto.refreshToken,
      );
      expect(result).toEqual(tokens);
    });

    it('should throw UnauthorizedException with invalid refresh token', async () => {
      // Arrange
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };

      const currentUser = {
        sub: 'user-id-123',
        email: 'user@example.com',
      };

      service.refreshTokens.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      // Act & Assert
      await expect(
        controller.refreshTokens(refreshTokenDto, currentUser as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
