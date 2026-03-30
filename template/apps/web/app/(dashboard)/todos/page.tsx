import { TodoList } from '@/components/tables/todo-tables';
import { getTodos } from '@/lib/api/todo-api.service';
import { getSession } from '@/lib/auth/session';
import { forbidden } from 'next/navigation';
import React from 'react';

async function TodoPage() {
  const session = await getSession();
  if (!session) forbidden();
  const todos = await getTodos();
  return <TodoList todos={todos} userId={session.user.id} />;
}

export default TodoPage;
