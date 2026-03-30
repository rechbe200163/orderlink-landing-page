import { ApiProperty } from '@nestjs/swagger';

import {
  UserEntity,
  type UserEntity as UserEntityAsType,
} from 'src/users/entities/user.entity';
import { Todo } from '@workspace/database';
import { Expose } from 'class-transformer';

export class TodoEntity implements Todo {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty({
    type: 'string',
  })
  id: string;

  @Expose()
  @ApiProperty({
    type: 'boolean',
  })
  completed: boolean;

  @Expose()
  @ApiProperty({
    maximum: 255,
    type: 'string',
  })
  description: string;

  @Expose()
  @ApiProperty({
    type: () => UserEntity,
    required: false,
  })
  user?: UserEntityAsType;

  @Expose()
  @ApiProperty({
    type: 'string',
  })
  userId: string;
}
