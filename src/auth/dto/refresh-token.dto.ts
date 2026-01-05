import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ example: 'hashed-refresh-token-string', description: 'Refresh token received on login' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
