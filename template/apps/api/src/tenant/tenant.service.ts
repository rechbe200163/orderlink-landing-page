import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateAddressDto } from 'src/addresses/dto/create-address.dto';
import { TenantRepository } from './tenant.repository';
import { AddressesService } from 'src/addresses/addresses.service';
import { DokployService } from 'src/dokploy/dokploy.service';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { TenantEntity } from './entities/tenant.entity';
import { CreateTenantOnboardingTenantDto } from './dto/create-tenant-onboarding.dto';
import { Tenant } from '@workspace/database';

@Injectable()
export class TenantService {
  constructor(
    private readonly tR: TenantRepository,
    private readonly aS: AddressesService,
    private readonly dokployService: DokployService,
    private readonly tenantProvisioningService: TenantProvisioningService,
  ) {}

  async createNew(
    createTenantDto: CreateTenantOnboardingTenantDto,
    createAddressDto: CreateAddressDto,
  ): Promise<TenantEntity> {
    const subdomain = this.generateSubdomain(createTenantDto.companyName);
    const address = await this.aS.findOrCreate(createAddressDto);
    const existingTenant = await this.tR.findBySubdomain(subdomain);

    if (existingTenant) {
      if (this.isRetryCompatible(existingTenant, createTenantDto, address.addressId)) {
        return new TenantEntity(existingTenant);
      }

      throw new BadRequestException(
        `Generated subdomain "${subdomain}" already exists`,
      );
    }

    const tenantData: CreateTenantDto = {
      ...createTenantDto,
      subdomain,
      addressId: address.addressId,
    };

    const { databaseUrl } =
      await this.dokployService.createPostgressDatabase(tenantData);

    await this.tenantProvisioningService.pushSchemaWithRetry(databaseUrl);
    await this.tenantProvisioningService.seedWithRetry(databaseUrl, {
      subdomain,
    });

    const persistedTenantData: CreateTenantDto = {
      ...tenantData,
      dbUrl: databaseUrl,
    };

    const tenant = await this.tR.create(persistedTenantData);
    return new TenantEntity(tenant);
  }
  create(createTenantDto: CreateTenantDto) {
    return 'This action adds a new tenant';
  }

  findAll() {
    return `This action returns all tenant`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tenant`;
  }

  update(id: number, updateTenantDto: UpdateTenantDto) {
    return `This action updates a #${id} tenant`;
  }

  remove(id: number) {
    return `This action removes a #${id} tenant`;
  }

  private generateSubdomain(companyName: string): string {
    const subdomain = companyName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    if (!subdomain) {
      throw new BadRequestException(
        'Could not generate a valid subdomain from companyName',
      );
    }

    return subdomain;
  }

  private isRetryCompatible(
    existingTenant: Tenant,
    createTenantDto: CreateTenantOnboardingTenantDto,
    addressId: string,
  ): boolean {
    return (
      existingTenant.companyName === createTenantDto.companyName &&
      existingTenant.description === (createTenantDto.description ?? null) &&
      existingTenant.addressId === addressId
    );
  }
}
