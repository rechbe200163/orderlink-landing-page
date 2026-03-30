import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'creates a users' })
  @ApiOkResponse({
    type: UserEntity,
    description: 'User created successfully',
  })
  @ApiBody({
    type: CreateUserDto,
  })
  create(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'returns a list of users' })
  @ApiOkResponse({
    type: [UserEntity],
    description: 'List of all users',
  })
  @ApiOkResponse({})
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'returns one user' })
  @ApiOkResponse({
    type: UserEntity,
    description: 'User found by ID',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'updates a user and returns updated user entity' })
  @ApiOkResponse({
    type: UserEntity,
    description: 'User updated successfully',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'deletes a user' })
  @ApiNoContentResponse({
    description: 'User deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
