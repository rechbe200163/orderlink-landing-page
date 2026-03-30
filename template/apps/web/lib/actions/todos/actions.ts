'use server';

import { apiClient } from '@/lib/api-client.server';
import { ENDPOINTS } from '@/lib/endpoints';
import { FormState } from '@/lib/fom.types';
import { Todos, UpdateTodo } from '@/lib/types';

export async function addTodo(todo: Todos): Promise<FormState> {
  return apiClient.safePost(ENDPOINTS.TODOS.POST, { body: todo });
}

export async function updateTodo(todo: UpdateTodo, id: string) {
  return apiClient.safePatch(ENDPOINTS.TODOS.PATCH(id), { body: todo });
}

export async function deleteTodo(id: string) {
  return apiClient.safeDelete(ENDPOINTS.TODOS.DELETE(id));
}
