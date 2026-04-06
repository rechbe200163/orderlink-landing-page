import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Subdomain of the tenant',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  subdomain: string;

  @ApiProperty({
    description: 'Database URL of the tenant',
    minLength: 5,
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  dbUrl?: string;

  @ApiProperty({
    description: 'Description of the tenant',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Company name of the tenant',
    required: true,
    nullable: true,
  })
  @IsString()
  companyName: string;

  @ApiProperty({
    description: 'Address ID of the tenant',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  addressId?: string;
}
