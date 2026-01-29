import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SelectCondominioDto } from './dto/select-condominio.dto';
import { ResponseUtil } from '../utils/response.util';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Public()
  @Post('register')
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request - Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this._authService.register(registerDto);
    return ResponseUtil.success(result, 'User registered successfully');
  }

  @Public()
  @Post('login')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this._authService.login(loginDto);
    return result; // El TransformInterceptor ya envuelve la respuesta
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@CurrentUser() user: any) {
    await this._authService.logout(user.sub);
    return ResponseUtil.success(null, 'Logout successful');
  }

  @UseGuards(JwtAuthGuard)
  @Post('select-condominio')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Select a condominio and get new tokens with condominioId' })
  @ApiResponse({ status: 200, description: 'Condominio selected successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized or no access to condominio' })
  async selectCondominio(
    @CurrentUser() user: any,
    @Body() selectCondominioDto: SelectCondominioDto,
  ) {
    const tokens = await this._authService.selectCondominio(
      user.sub,
      selectCondominioDto.condominioId,
    );
    return tokens; // El TransformInterceptor ya envuelve la respuesta
  }

  @Public()
  @Post('refresh')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto, @CurrentUser() user: any) {
    const tokens = await this._authService.refreshTokens(user.sub, refreshTokenDto.refreshToken);
    return ResponseUtil.success(tokens, 'Tokens refreshed successfully');
  }
}
