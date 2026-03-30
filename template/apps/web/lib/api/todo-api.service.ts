'server-only';

import { ENDPOINTS } from '../endpoints';
import { Todos } from '../types';
import { apiClient } from '../api-client.server';

// ------------------------------------------------------
//  GET todos
// ------------------------------------------------------
export async function getTodos(): Promise<Todos[]> {
  const todos = apiClient.get<Todos[]>(ENDPOINTS.TODOS.GET);
  console.log(JSON.stringify(todos, null, 2));
  return todos;
}
