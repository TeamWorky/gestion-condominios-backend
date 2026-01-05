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
    await this._usersService.updateRefreshToken(user.id, tokens.refreshToken);

    const { password, refreshToken, ...result } = user;

    return {
      user: result,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const tokens = await this.generateTokens(user);
    await this._usersService.updateRefreshToken(user.id, tokens.refreshToken);

    const { password, refreshToken, ...result } = user;

    return {
      user: result,
      ...tokens,
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
    await this._usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this._usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

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
      refreshToken: hashedRefreshToken,
    };
  }
}
