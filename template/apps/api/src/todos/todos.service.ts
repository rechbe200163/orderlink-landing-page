import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoRepository } from './todos.repository';
import { TodoEntity } from './entities/todo.entity';

@Injectable()
export class TodosService {
  constructor(private readonly todoRepo: TodoRepository) {}
  async create(
    createTodoDto: CreateTodoDto,
    userId: string,
  ): Promise<TodoEntity> {
    return new TodoEntity(await this.todoRepo.create(createTodoDto, userId));
  }

  async findAll(userId: string): Promise<TodoEntity[]> {
    const todos = await this.todoRepo.findAll(userId);
    return todos.map((t) => new TodoEntity(t));
  }

  async findOne(id: string, userId: string): Promise<TodoEntity> {
    const todo = await this.todoRepo.findOne(id, userId);
    if (!todo) throw new NotFoundException('todo not found');
    return new TodoEntity(todo);
  }

  async update(
    id: string,
    updateTodoDto: UpdateTodoDto,
    userId: string,
  ): Promise<TodoEntity> {
    const updatedTodo = await this.todoRepo.update(id, updateTodoDto);
    if (!updatedTodo) throw new NotFoundException('todo not found');
    return new TodoEntity(updatedTodo);
  }

  async remove(id: string) {
    return new TodoEntity(await this.todoRepo.remove(id));
  }
}
