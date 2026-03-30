import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { hash } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const user = await this.repo.create({
      ...dto,
      password: await hash(dto.password, 10),
    });
    return new UserEntity(user);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.repo.findAll();
    return users.map((u) => new UserEntity(u));
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.repo.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return new UserEntity(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.repo.update(id, dto);
    return new UserEntity(user);
  }

  async remove(id: string): Promise<void> {
    await this.repo.remove(id);
  }
}
