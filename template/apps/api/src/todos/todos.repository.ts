import { Injectable } from '@nestjs/common';
import { PrismaService } from 'database/prisma.service';
import { Todo } from '@workspace/database';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTodoDto, userId: string): Promise<Todo> {
    return this.prisma.todo.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  findAll(userId: string): Promise<Todo[]> {
    return this.prisma.todo.findMany({ where: { userId } });
  }

  findOne(id: string, userId: string): Promise<Todo | null> {
    return this.prisma.todo.findUnique({ where: { id, userId } });
  }

  findByCompleted(completed: boolean, userId: string): Promise<Todo[] | null> {
    return this.prisma.todo.findMany({
      where: {
        completed,
        userId,
      },
    });
  }

  update(id: string, data: UpdateTodoDto): Promise<Todo> {
    return this.prisma.todo.update({ where: { id }, data });
  }

  remove(id: string): Promise<Todo> {
    return this.prisma.todo.delete({ where: { id } });
  }
}
