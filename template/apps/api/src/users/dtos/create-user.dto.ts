import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({
    description: 'First name of the user',
    default: 'John',
    type: String,
    minimum: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string | null;

  @ApiProperty({
    description: 'Last name of the user',
    default: 'Doe',
    type: String,
    minimum: 2,
  })
  @IsString()
  @MinLength(2)
  lastName!: string;

  @ApiProperty({
    description: 'Email of the user',
    default: 'test@test.at',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Hashed password of the user',
    default: '1234567890',
    minimum: 10,
  })
  @IsString()
  @MinLength(10)
  password!: string;
}
