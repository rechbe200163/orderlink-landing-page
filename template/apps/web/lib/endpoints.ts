export const ENDPOINTS = {
  AUTH: {
    LOGIN: 'auth/signIn',
    RENEW_SESSION: 'auth/renewSession',
  },
  TODOS: {
    GET: 'todos',
    PATCH: (id: string) => `todos/${id}`,
    POST: 'todos',
    DELETE: (id: string) => `todos/${id}`,
  },
} as const;

export const enum EnpointMethod {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export type EndpointKey = keyof typeof ENDPOINTS;
