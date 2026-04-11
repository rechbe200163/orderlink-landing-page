import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateAddressDto } from 'src/addresses/dto/create-address.dto';
import { CreateTenantDto } from './create-tenant.dto';

export class CreateTenantOnboardingTenantDto extends OmitType(CreateTenantDto, [
  'addressId',
  'dbUrl',
  'subdomain',
] as const) {
  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  iban: string;

  @ApiProperty()
  companyNumber: string;
}

export class CreateTenantOnboardingDto {
  @ApiProperty({ type: CreateTenantOnboardingTenantDto })
  @ValidateNested()
  @Type(() => CreateTenantOnboardingTenantDto)
  tenant: CreateTenantOnboardingTenantDto;

  @ApiProperty({ type: CreateAddressDto })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;
}
