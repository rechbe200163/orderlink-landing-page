import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    description: 'First name of the user',
    minimum: 5,
    type: 'string',
    nullable: true,
  })
  firstName: string | null;
  @ApiProperty({
    description: 'Last name of the user',
    minimum: 5,
    type: 'string',
  })
  lastName: string;
  @ApiProperty({
    description: 'Email of the user',
    type: 'string',
    nullable: true,
  })
  email: string | null;
  @ApiProperty({
    description: 'Hashed password of the user',
    minimum: 10,
    type: 'string',
  })
  password: string;
}
