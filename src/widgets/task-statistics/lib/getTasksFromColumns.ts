import type { Task, TasksByColumnId } from '@/entities/task';

export const getTasksFromColumns = (tasksByColumnId: TasksByColumnId): Task[] => {
  return Object.values(tasksByColumnId).flatMap((tasks) => tasks ?? []);
};
