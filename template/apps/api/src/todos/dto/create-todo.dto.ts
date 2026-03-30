import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
export class CreateTodoDto {
  @ApiProperty({
    type: 'boolean',
    default: false,
    required: false,
  })
  @IsBoolean()
  completed?: boolean;
  @ApiProperty({
    maximum: 255,
    type: 'string',
  })
  @IsString()
  description: string;
}
