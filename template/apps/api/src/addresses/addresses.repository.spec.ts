import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AddressesRepository } from './addresses.repository';
import { PrismaService } from 'database/prisma.service';

const prismaMock = {
  db: {
    address: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
};

describe('AddressesRepository', () => {
  let repository: AddressesRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repository = module.get<AddressesRepository>(AddressesRepository);
  });

  it('reuses an existing address for duplicate input', async () => {
    const existingAddress = { addressId: 'address-1' };

    prismaMock.db.address.findUnique.mockResolvedValue(existingAddress);

    const result = await repository.create({
      streetName: 'Main Street',
      streetNumber: '1',
      city: 'Vienna',
      postCode: '1010',
      state: 'Vienna',
      country: 'AT',
    });

    expect(prismaMock.db.address.create).not.toHaveBeenCalled();
    expect(result).toBe(existingAddress);
  });

  it('returns the concurrently created address after a unique conflict', async () => {
    const createdAddress = { addressId: 'address-1' };

    prismaMock.db.address.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createdAddress);
    prismaMock.db.address.create.mockRejectedValue({ code: 'P2002' });

    const result = await repository.create({
      streetName: 'Main Street',
      streetNumber: '1',
      city: 'Vienna',
      postCode: '1010',
      state: 'Vienna',
      country: 'AT',
    });

    expect(prismaMock.db.address.create).toHaveBeenCalledWith({
      data: {
        streetName: 'Main Street',
        streetNumber: '1',
        city: 'Vienna',
        postCode: '1010',
        state: 'Vienna',
        country: 'AT',
      },
    });
    expect(result).toBe(createdAddress);
  });

  it('finds address by id', async () => {
    prismaMock.db.address.findUnique.mockResolvedValue({ addressId: '1' });

    const result = await repository.findById('1');

    expect(prismaMock.db.address.findUnique).toHaveBeenCalledWith({
      where: { addressId: '1' },
    });
    expect(result).toEqual({ addressId: '1' });
  });

  it('throws when address not found', async () => {
    prismaMock.db.address.findUnique.mockResolvedValue(null);

    await expect(repository.findById('1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates address', async () => {
    prismaMock.db.address.findUnique.mockResolvedValue({ addressId: '1' });
    prismaMock.db.address.update.mockResolvedValue({
      addressId: '1',
      city: 'Berlin',
    });

    const result = await repository.update('1', { city: 'Berlin' } as any);

    expect(prismaMock.db.address.update).toHaveBeenCalledWith({
      where: { addressId: '1' },
      data: { city: 'Berlin' },
    });
    expect(result).toEqual({ addressId: '1', city: 'Berlin' });
  });
});
