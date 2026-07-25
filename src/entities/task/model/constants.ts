export { DEFAULT_TYPE } from '@/shared/config';
import { BookOpen, Bug, ListTodo } from 'lucide-react';
import type { TaskPriority, TaskType } from './types';

export const TASK_PRIORITY_CONFIG = [
  { id: 'low', title: 'Низкий', color: 'priorityLow' },
  { id: 'medium', title: 'Средний', color: 'priorityMedium' },
  { id: 'high', title: 'Высокий', color: 'priorityHigh' },
] as const;

export const TASK_PRIORITIES = TASK_PRIORITY_CONFIG.map(({ id }) => id);

export const TASK_PRIORITY_TITLE = Object.fromEntries(
  TASK_PRIORITY_CONFIG.map(({ id, title }) => [id, title]),
) as Record<TaskPriority, string>;

export const TASK_PRIORITY_COLOR = Object.fromEntries(
  TASK_PRIORITY_CONFIG.map(({ id, color }) => [id, color]),
) as Record<TaskPriority, string>;

export const TASK_TYPE_CONFIG = [
  {
    id: 'task',
    title: 'Task',
    color: 'brand',
    icon: ListTodo,
  },
  {
    id: 'bug',
    title: 'Bug',
    color: 'priorityHigh',
    icon: Bug,
  },
  {
    id: 'story',
    title: 'Story',
    color: 'statusTodo',
    icon: BookOpen,
  },
] as const;

export const TASK_TYPES = TASK_TYPE_CONFIG.map(({ id }) => id);

export const TASK_TYPE_TITLE = Object.fromEntries(
  TASK_TYPE_CONFIG.map(({ id, title }) => [id, title]),
) as Record<TaskType, string>;
