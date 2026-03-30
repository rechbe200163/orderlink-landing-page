import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { TodoRepository } from './todos.repository';
import { PrismaService } from 'database/prisma.service';

@Module({
  controllers: [TodosController],
  providers: [TodosService, TodoRepository, PrismaService],
})
export class TodosModule {}
