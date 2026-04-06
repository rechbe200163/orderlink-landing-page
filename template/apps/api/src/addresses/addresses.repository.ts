import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'database/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from '@workspace/database';

function isUniqueConstraintError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    error.code === 'P2002'
  );
}

@Injectable()
export class AddressesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAddressDto): Promise<Address> {
    const existing = await this.findByUniqueFields(data);

    if (existing) {
      return existing;
    }

    try {
      const address = await this.prisma.db.address.create({
        data,
      });
      return address;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        const concurrentAddress = await this.findByUniqueFields(data);

        if (concurrentAddress) {
          return concurrentAddress;
        }
      }

      throw error;
    }
  }

  // async findAllPaging(
  //   limit = 10,
  //   page = 1,
  //   query?: string,
  // ): Promise<PagingResultDto<AddressDto>> {
  //   const [addresses, meta] = await this.prisma.db.address
  //     .paginate({
  //       where: {
  //         deleted: false,
  //         ...(query && {
  //           OR: [
  //             { streetName: { contains: query, mode: 'insensitive' } },
  //             { city: { contains: query, mode: 'insensitive' } },
  //           ],
  //         }),
  //       },
  //     })
  //     .withPages({ limit, page, includePageCount: true });

  //   return {
  //     data: addresses.map((a: AddressDto) => transformResponse(AddressDto, a)),
  //     meta,
  //   };
  // }

  // async findAll(): Promise<AddressEntity[]> {
  //   const addresses = await this.prisma.address.findMany({
  //     where: { deleted: false },
  //   });
  //   // return addresses.map((a: AddressDto) => transformResponse(AddressDto, a));
  //   return
  // }

  async find(
    streetName: string,
    streetNumber: string,
    city: string,
    postCode: string,
    state: string,
    country: string,
  ): Promise<Address | null> {
    const address = await this.prisma.db.address.findUnique({
      where: {
        streetName_streetNumber_city_postCode_state_country: {
          streetName,
          streetNumber,
          city,
          postCode,
          state,
          country,
        },
      },
    });
    return address;
  }

  private findByUniqueFields(data: CreateAddressDto): Promise<Address | null> {
    return this.find(
      data.streetName,
      data.streetNumber,
      data.city,
      data.postCode,
      data.state,
      data.country,
    );
  }

  async findById(addressId: string): Promise<Address> {
    const address = await this.prisma.db.address.findUnique({
      where: { addressId },
    });
    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }
    return address;
  }

  async update(addressId: string, data: UpdateAddressDto): Promise<Address> {
    const existing = await this.prisma.db.address.findUnique({
      where: { addressId },
    });
    if (!existing) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }
    const address = await this.prisma.db.address.update({
      where: { addressId },
      data,
    });
    return address;
  }
}
