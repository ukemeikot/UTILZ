import { create } from 'zustand';

import type { TodoItem, TodoPriority } from '../types/todo.types';
import { getStoredItem, setStoredItem } from '../utils/storage';

const TODO_STORAGE_KEY = 'utilz-todos';

type TodoPayload = {
  id?: string;
  title: string;
  details: string;
  dueDate?: string | null;
  priority: TodoPriority;
};

type TodoStore = {
  todos: TodoItem[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  saveTodo: (payload: TodoPayload) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  moveTodo: (id: string, direction: 'up' | 'down') => Promise<void>;
  reorderTodos: (todos: TodoItem[]) => Promise<void>;
};

async function persistTodos(todos: TodoItem[]) {
  await setStoredItem(TODO_STORAGE_KEY, todos);
}

function reorderItem(
  todos: TodoItem[],
  id: string,
  direction: 'up' | 'down',
) {
  const index = todos.findIndex((item) => item.id === id);

  if (index === -1) {
    return todos;
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= todos.length) {
    return todos;
  }

  const next = [...todos];
  const [moved] = next.splice(index, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  hydrated: false,
  hydrate: async () => {
    const stored = await getStoredItem<TodoItem[]>(TODO_STORAGE_KEY, []);
    const normalized = stored.map((item) => ({
      ...item,
      details: item.details ?? '',
      dueDate: item.dueDate ?? null,
      priority: item.priority ?? 'medium',
      completed: item.completed ?? false,
      createdAt: item.createdAt ?? item.updatedAt ?? Date.now(),
      updatedAt: item.updatedAt ?? item.createdAt ?? Date.now(),
    }));

    set({ todos: normalized, hydrated: true });
  },
  saveTodo: async ({ id, title, details, dueDate, priority }) => {
    const timestamp = Date.now();
    const existing = get().todos;
    const existingTodo = id ? existing.find((item) => item.id === id) : undefined;

    const todo: TodoItem = {
      id: id ?? `${timestamp}-${Math.random()}`,
      title: title.trim() || 'Untitled task',
      details: details.trim(),
      dueDate: dueDate?.trim() ? dueDate.trim() : null,
      priority,
      completed: existingTodo?.completed ?? false,
      createdAt: existingTodo?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    const next = id
      ? [todo, ...existing.filter((item) => item.id !== id)]
      : [todo, ...existing];

    set({ todos: next });
    await persistTodos(next);
  },
  toggleTodo: async (id) => {
    const next = get().todos.map((item) =>
      item.id === id
        ? {
            ...item,
            completed: !item.completed,
            updatedAt: Date.now(),
          }
        : item,
    );

    set({ todos: next });
    await persistTodos(next);
  },
  deleteTodo: async (id) => {
    const next = get().todos.filter((item) => item.id !== id);
    set({ todos: next });
    await persistTodos(next);
  },
  moveTodo: async (id, direction) => {
    const next = reorderItem(get().todos, id, direction);
    set({ todos: next });
    await persistTodos(next);
  },
  reorderTodos: async (todos) => {
    set({ todos });
    await persistTodos(todos);
  },
}));
