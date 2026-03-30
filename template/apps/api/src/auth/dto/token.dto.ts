// auth/dto/auth-result.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({ type: String })
  accessToken: string;

  @ApiProperty({ type: Number })
  issuedAt: number;

  @ApiProperty({ type: Number })
  expiresAt: number;
}
