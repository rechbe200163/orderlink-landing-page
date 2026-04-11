import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateTenantDto } from './dto/create-tenant.dto';

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
