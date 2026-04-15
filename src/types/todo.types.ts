export type TodoPriority = 'low' | 'medium' | 'high';

export type TodoFilter = 'all' | 'open' | 'done';

export type TodoItem = {
  id: string;
  title: string;
  details: string;
  dueDate: string | null;
  priority: TodoPriority;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
};
