'use client';

import { startTransition, useOptimistic, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@workspace/ui/lib/utils';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Todos, UpdateTodo } from '@/lib/types';
import { addTodo, deleteTodo, updateTodo } from '@/lib/actions/todos/actions';

export const TodoList = ({
  todos,
  userId,
}: {
  todos: Todos[];
  userId: string;
}) => {
  const [todo, setTodo] = useState('');

  const [optimisticTodos, mutateOptimisticTodo] = useOptimistic(
    todos,
    (
      state,
      action:
        | { type: 'create'; payload: Todos }
        | { type: 'delete'; payload: string }
        | { type: 'update'; payload: { id: string; update: UpdateTodo } }
    ) => {
      switch (action.type) {
        case 'create':
          return [...state, action.payload];
        case 'delete':
          return state.filter((todo) => todo.id !== action.payload);
        case 'update':
          return state.map((todo) =>
            todo.id === action.payload.id
              ? { ...todo, ...action.payload.update }
              : todo
          );
        default:
          return state;
      }
    }
  );
  console.log(optimisticTodos);

  const handleCreateTodo = () => {
    if (!todo) return;
    startTransition(async () => {
      const newTodo: Todos = {
        id: crypto.randomUUID(),
        description: todo,
        completed: false,
        userId,
      };
      mutateOptimisticTodo({
        type: 'create',
        payload: newTodo,
      });
      const result = await addTodo(newTodo);
      if (!result.success) {
        toast.error('Failed to add todo');
      }
    });
    setTodo('');
  };

  const handleDeleteTodo = async (id: string) => {
    startTransition(async () => {
      mutateOptimisticTodo({ type: 'delete', payload: id });
      await deleteTodo(id);
    });
  };

  const handleUpdateTodo = async (id: string, update: UpdateTodo) => {
    startTransition(async () => {
      mutateOptimisticTodo({ type: 'update', payload: { id, update } });
      await updateTodo(update, id);
    });
  };

  return (
    <div className='flex flex-col gap-4 bg-foreground/5 min-h-[200px] p-6 rounded-xl'>
      <h1 className='text-2xl font-bold'>Todo List</h1>
      <div className='flex gap-2'>
        <Input
          className='flex-1'
          placeholder='subscribe to Tobi Mey'
          value={todo}
          onChange={(e) => setTodo(e.target.value)}
        />
        <Button onClick={handleCreateTodo}>
          <IconPlus />
          Add Todo
        </Button>
      </div>
      <ul className='max-h-[400px] overflow-y-auto flex flex-col gap-2'>
        {optimisticTodos.map((todo) => (
          <li key={todo.id} className='flex gap-2'>
            <button
              className='flex-1 text-left'
              onClick={() =>
                handleUpdateTodo(todo.id, { completed: !todo.completed })
              }
            >
              <h3 className={cn(todo.completed && 'line-through')}>
                {todo.description}
              </h3>
            </button>
            <Button variant='outline' onClick={() => handleDeleteTodo(todo.id)}>
              <IconTrash />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};
