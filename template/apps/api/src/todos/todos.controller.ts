import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { RequestWithUser } from 'lib/types';

@ApiTags('todos')
@Controller('todos')
@ApiBearerAuth('Bearer')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}
  @Post()
  create(
    @Req() request: RequestWithUser,
    @Body() createTodoDto: CreateTodoDto,
  ) {
    const userId = request.user.id;
    console.log(createTodoDto, userId);
    return this.todosService.create(createTodoDto, userId);
  }

  @Get()
  findAll(@Req() request: RequestWithUser) {
    return this.todosService.findAll(request.user.id);
  }

  @Get(':id')
  findOne(@Req() request: RequestWithUser, @Param('id') id: string) {
    return this.todosService.findOne(id, request.user.id);
  }

  @Patch(':id')
  update(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todosService.update(id, updateTodoDto, request.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todosService.remove(id);
  }
}
