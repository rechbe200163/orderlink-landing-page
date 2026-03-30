export type Todos = {
  id: string;
  completed: boolean;
  description: string;
  userId: string;
};

export type UpdateTodo = {
  completed?: boolean;
  description?: string;
};

export type Users = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  todos?: Todos[];
};
