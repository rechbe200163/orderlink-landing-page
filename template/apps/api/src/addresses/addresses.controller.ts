import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateAddressDto } from './dto/create-address.dto';
import { AddressEntity } from './entities/address.entity';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('addresses')
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiForbiddenResponse({
  description:
    'Role does not have the permissions to perform this action on the requested resource',
})
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiBody({ type: CreateAddressDto })
  @ApiOkResponse({ type: AddressEntity })
  create(@Body() createAddressDto: CreateAddressDto) {
    console.log('Creating address with data:', createAddressDto);
    return this.addressesService.create(createAddressDto);
  }

  @Get()
  // @ApiQuery({
  //   name: 'limit',
  //   type: Number,
  //   required: false,
  //   default: 10,
  //   maximum: MAX_PAGE_SIZE,
  // })
  // @ApiQuery({ name: 'page', type: Number, required: false, default: 1 })
  // @ApiQuery({
  //   name: 'query',
  //   type: String,
  //   required: false,
  //   description: 'Optional search query to filter addresses',
  //   example: '123 Main St',
  // })
  findAll(
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('page', ParseIntPipe) page = 1,
    @Query('query') query?: string,
  ) {
    // if (limit > MAX_PAGE_SIZE) {
    //   throw new BadRequestException(`Limit cannot exceed ${MAX_PAGE_SIZE}`);
    // }
    return this.addressesService.findAllPaging(limit, page, query);
  }

  @Get('all')
  @ApiOkResponse({ type: [AddressEntity] })
  findAllAddresses() {
    return this.addressesService.findAll();
  }

  @Get(':addressId')
  @ApiParam({ name: 'addressId', type: String })
  @ApiOkResponse({ type: AddressEntity })
  findOne(@Param('addressId', ParseUUIDPipe) addressId: string) {
    return this.addressesService.findById(addressId);
  }

  @Patch(':addressId')
  @ApiParam({ name: 'addressId', type: String })
  @ApiBody({ type: UpdateAddressDto })
  @ApiOkResponse({ type: AddressEntity })
  update(
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(addressId, updateAddressDto);
  }
}
