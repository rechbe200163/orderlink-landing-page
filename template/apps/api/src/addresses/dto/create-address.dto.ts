import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  postCode: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  streetName: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  streetNumber: string;
}
