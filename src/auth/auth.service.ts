import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException, AlreadyExistsException } from '../common/exceptions/business.exception';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this._usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new AlreadyExistsException('Email');
    }

    const user = await this._usersService.create({
      ...registerDto,
      role: undefined,
    });

    const tokens = await this.generateTokens(user);
    await this._usersService.updateRefreshToken(user.id, tokens.hashedRefreshToken);

    const { password, refreshToken, ...result } = user;

    return {
      user: result,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const tokens = await this.generateTokens(user);
    await this._usersService.updateRefreshToken(user.id, tokens.hashedRefreshToken);

    const { password, refreshToken, ...result } = user;

    // Obtener condominios del usuario
    // TODO: Reemplazar con consulta real a la base de datos cuando se implemente la relación
    const condominios = this.getCondominiosForUser(user.email, user.role);

    return {
      user: result,
      condominios,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken, // Token plano para el cliente
    };
  }

  /**
   * Obtiene los condominios asignados a un usuario
   * TODO: Reemplazar con consulta real a la base de datos
   */
  private getCondominiosForUser(email: string, role: string): any[] {
    // SUPER_ADMIN tiene acceso a todos los condominios
    if (role === 'SUPER_ADMIN') {
      return [
        {
          id: '4b7bdcca-c9c3-439a-8c86-214384b2e815',
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
          createdAt: '2026-01-05T13:40:06.935Z',
          updatedAt: '2026-01-05T13:40:06.935Z',
        },
        {
          id: 'a9ba26a2-5645-4f5b-9632-ec3f36181275',
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
          createdAt: '2026-01-05T13:40:06.946Z',
          updatedAt: '2026-01-05T13:40:06.946Z',
        },
      ];
    }

    // ADMIN de Torres del Sol
    if (email === 'admin@torresdelsol.cl') {
      return [
        {
          id: '4b7bdcca-c9c3-439a-8c86-214384b2e815',
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
          createdAt: '2026-01-05T13:40:06.935Z',
          updatedAt: '2026-01-05T13:40:06.935Z',
        },
      ];
    }

    // ADMIN de Jardines del Este
    if (email === 'admin@jardinesdeleste.cl') {
      return [
        {
          id: 'a9ba26a2-5645-4f5b-9632-ec3f36181275',
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
          createdAt: '2026-01-05T13:40:06.946Z',
          updatedAt: '2026-01-05T13:40:06.946Z',
        },
      ];
    }

    // Por defecto, retornar array vacío
    return [];
  }

  async selectCondominio(userId: string, condominioId: string) {
    const user = await this._usersService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verificar que el usuario tenga acceso al condominio
    const condominios = this.getCondominiosForUser(user.email, user.role);
    const hasAccess = condominios.some(c => c.id === condominioId);

    if (!hasAccess) {
      throw new UnauthorizedException('User does not have access to this condominio');
    }

    // Generar nuevos tokens con el condominioId en el payload
    const tokens = await this.generateTokens(user, condominioId);
    await this._usersService.updateRefreshToken(user.id, tokens.hashedRefreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string) {
    await this._usersService.updateRefreshToken(userId, null);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this._usersService.findOne(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);
    await this._usersService.updateRefreshToken(user.id, tokens.hashedRefreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this._usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    // Usar bcrypt directamente porque el objeto puede venir de caché y no ser una instancia de User
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private async generateTokens(user: User, condominioId?: string) {
    const payload: any = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Incluir condominioId en el payload si se proporciona
    if (condominioId) {
      payload.condominioId = condominioId;
    }

    const jwtSecret = this._configService.get<string>('JWT_SECRET') || 'default-secret-change-me';
    const jwtRefreshSecret = this._configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret-change-me';

    const [accessToken, refreshToken] = await Promise.all([
      this._jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: '15m',
      }),
      this._jwtService.signAsync(payload, {
        secret: jwtRefreshSecret,
        expiresIn: '7d',
      }),
    ]);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    return {
      accessToken,
      refreshToken, // Token plano para retornar al cliente
      hashedRefreshToken, // Hash para guardar en la DB
    };
  }
}
