import {
  HttpException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { AddressesRepository } from './addresses.repository';
import { AddressEntity } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { PagingResultDto } from 'lib/genericPagingResultDto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly addressesRepository: AddressesRepository) {}

  async create(createAddressDto: CreateAddressDto): Promise<AddressEntity> {
    const address = await this.addressesRepository.create(createAddressDto);
    return new AddressEntity(address);
  }

  async findOrCreate(createAddressDto: CreateAddressDto): Promise<AddressEntity> {
    const address = await this.addressesRepository.create(createAddressDto);
    return new AddressEntity(address);
  }

  async findAllPaging(
    limit = 10,
    page = 1,
    query?: string,
  ): Promise<PagingResultDto<AddressEntity> | HttpException> {
    return new NotImplementedException('findAllPaging is not implemented yet');
  }

  async findAll(): Promise<AddressEntity[] | HttpException> {
    return new NotImplementedException('findAll is not implemented yet');
  }

  async findById(id: string): Promise<AddressEntity> {
    const address = await this.addressesRepository.findById(id);
    return new AddressEntity(address);
  }

  async update(
    id: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<AddressEntity> {
    const address = await this.addressesRepository.update(id, updateAddressDto);
    return new AddressEntity(address);
  }
}
