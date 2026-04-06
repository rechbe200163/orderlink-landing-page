import { Test, TestingModule } from '@nestjs/testing';
import { NotImplementedException } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesRepository } from './addresses.repository';
import { AddressEntity } from './entities/address.entity';

describe('AddressesService', () => {
  let service: AddressesService;
  let repository: {
    create: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        {
          provide: AddressesRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
  });

  it('wraps created addresses in an entity', async () => {
    repository.create.mockResolvedValue({ addressId: 'address-1' });

    const result = await service.create({ streetName: 'Main' } as any);

    expect(repository.create).toHaveBeenCalledWith({ streetName: 'Main' });
    expect(result).toBeInstanceOf(AddressEntity);
    expect(result.addressId).toBe('address-1');
  });

  it('reuses the same entity mapping for findOrCreate', async () => {
    repository.create.mockResolvedValue({ addressId: 'address-2' });

    const result = await service.findOrCreate({ streetName: 'Main' } as any);

    expect(repository.create).toHaveBeenCalledWith({ streetName: 'Main' });
    expect(result).toBeInstanceOf(AddressEntity);
    expect(result.addressId).toBe('address-2');
  });

  it('throws for paging until the endpoint is implemented', async () => {
    const result = await service.findAllPaging();
    expect(result).toBeInstanceOf(NotImplementedException);
  });

  it('throws for list-all until the endpoint is implemented', async () => {
    const result = await service.findAll();
    expect(result).toBeInstanceOf(NotImplementedException);
  });

  it('wraps findById responses in an entity', async () => {
    repository.findById.mockResolvedValue({ addressId: 'address-3' });

    const result = await service.findById('address-3');

    expect(repository.findById).toHaveBeenCalledWith('address-3');
    expect(result).toBeInstanceOf(AddressEntity);
    expect(result.addressId).toBe('address-3');
  });

  it('wraps updates in an entity', async () => {
    repository.update.mockResolvedValue({ addressId: 'address-4' });

    const result = await service.update('address-4', { city: 'Berlin' } as any);

    expect(repository.update).toHaveBeenCalledWith('address-4', {
      city: 'Berlin',
    });
    expect(result).toBeInstanceOf(AddressEntity);
    expect(result.addressId).toBe('address-4');
  });
});
