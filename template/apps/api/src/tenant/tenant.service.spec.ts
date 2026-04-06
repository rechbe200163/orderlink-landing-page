import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantRepository } from './tenant.repository';
import { AddressesService } from 'src/addresses/addresses.service';
import { DokployService } from 'src/dokploy/dokploy.service';
import { TenantProvisioningService } from './tenant-provisioning.service';
import { TenantEntity } from './entities/tenant.entity';

describe('TenantService', () => {
  let service: TenantService;
  let tenantRepository: {
    findBySubdomain: jest.Mock;
    create: jest.Mock;
  };
  let addressesService: {
    findOrCreate: jest.Mock;
  };
  let dokployService: {
    createPostgressDatabase: jest.Mock;
  };
  let provisioningService: {
    pushSchemaWithRetry: jest.Mock;
    seedWithRetry: jest.Mock;
  };

  beforeEach(async () => {
    tenantRepository = {
      findBySubdomain: jest.fn(),
      create: jest.fn(),
    };
    addressesService = {
      findOrCreate: jest.fn(),
    };
    dokployService = {
      createPostgressDatabase: jest.fn(),
    };
    provisioningService = {
      pushSchemaWithRetry: jest.fn(),
      seedWithRetry: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: TenantRepository,
          useValue: tenantRepository,
        },
        {
          provide: AddressesService,
          useValue: addressesService,
        },
        {
          provide: DokployService,
          useValue: dokployService,
        },
        {
          provide: TenantProvisioningService,
          useValue: provisioningService,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it('creates tenants only after address, database, schema push and seed succeed', async () => {
    tenantRepository.findBySubdomain.mockResolvedValue(null);
    addressesService.findOrCreate.mockResolvedValue({ addressId: 'address-1' });
    dokployService.createPostgressDatabase.mockResolvedValue({
      databaseUrl: 'postgresql://tenant-db',
    });
    provisioningService.pushSchemaWithRetry.mockResolvedValue(undefined);
    provisioningService.seedWithRetry.mockResolvedValue(undefined);
    tenantRepository.create.mockResolvedValue({
      tenantId: 'tenant-1',
      subdomain: 'tenantgmbh',
      dbUrl: 'postgresql://tenant-db',
      companyName: 'Tenant GmbH',
      description: null,
      addressId: 'address-1',
      isConfigured: true,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createNew(
      {
        companyName: 'Tenant GmbH',
      },
      {
        streetName: 'Main Street',
        streetNumber: '1',
        city: 'Vienna',
        postCode: '1010',
        state: 'Vienna',
        country: 'AT',
      },
    );

    expect(tenantRepository.findBySubdomain).toHaveBeenCalledWith('tenantgmbh');
    expect(addressesService.findOrCreate).toHaveBeenCalledWith({
      streetName: 'Main Street',
      streetNumber: '1',
      city: 'Vienna',
      postCode: '1010',
      state: 'Vienna',
      country: 'AT',
    });
    expect(dokployService.createPostgressDatabase).toHaveBeenCalledWith({
      subdomain: 'tenantgmbh',
      companyName: 'Tenant GmbH',
      addressId: 'address-1',
    });
    expect(provisioningService.pushSchemaWithRetry).toHaveBeenCalledWith(
      'postgresql://tenant-db',
    );
    expect(provisioningService.seedWithRetry).toHaveBeenCalledWith(
      'postgresql://tenant-db',
      {
        subdomain: 'tenantgmbh',
      },
    );
    expect(tenantRepository.create).toHaveBeenCalledWith({
      subdomain: 'tenantgmbh',
      companyName: 'Tenant GmbH',
      addressId: 'address-1',
      dbUrl: 'postgresql://tenant-db',
    });
    expect(result).toBeInstanceOf(TenantEntity);
    expect(result.tenantId).toBe('tenant-1');
  });

  it('returns the existing tenant for an idempotent retry without reprovisioning', async () => {
    addressesService.findOrCreate.mockResolvedValue({ addressId: 'address-1' });
    tenantRepository.findBySubdomain.mockResolvedValue({
      tenantId: 'tenant-1',
      subdomain: 'firmaa',
      dbUrl: 'postgresql://tenant-db',
      companyName: 'Firma A',
      description: null,
      addressId: 'address-1',
      isConfigured: true,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createNew(
      {
        companyName: 'Firma A',
      },
      {
        streetName: 'Main Street',
        streetNumber: '1',
        city: 'Vienna',
        postCode: '1010',
        state: 'Vienna',
        country: 'AT',
      },
    );

    expect(dokployService.createPostgressDatabase).not.toHaveBeenCalled();
    expect(provisioningService.pushSchemaWithRetry).not.toHaveBeenCalled();
    expect(provisioningService.seedWithRetry).not.toHaveBeenCalled();
    expect(tenantRepository.create).not.toHaveBeenCalled();
    expect(result).toBeInstanceOf(TenantEntity);
    expect(result.subdomain).toBe('firmaa');
  });

  it('throws bad request when the generated subdomain already belongs to different data', async () => {
    addressesService.findOrCreate.mockResolvedValue({ addressId: 'address-2' });
    tenantRepository.findBySubdomain.mockResolvedValue({
      tenantId: 'tenant-1',
      subdomain: 'firmaa',
      dbUrl: 'postgresql://tenant-db',
      companyName: 'Firma A',
      description: null,
      addressId: 'address-1',
      isConfigured: true,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.createNew(
        {
          companyName: 'Firma A',
        },
        {
          streetName: 'Other Street',
          streetNumber: '2',
          city: 'Vienna',
          postCode: '1010',
          state: 'Vienna',
          country: 'AT',
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(dokployService.createPostgressDatabase).not.toHaveBeenCalled();
    expect(tenantRepository.create).not.toHaveBeenCalled();
  });
});
