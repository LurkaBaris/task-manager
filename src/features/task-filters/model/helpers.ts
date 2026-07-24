import type { Task } from '@/entities/task';
import type { TaskFilters } from './types';

export const hasActiveTaskFilters = (filters: TaskFilters): boolean => {
  return filters.priorities.length > 0 || filters.types.length > 0 || filters.tagIds.length > 0;
};

export const getActiveTaskFiltersCount = (filters: TaskFilters): number => {
  return filters.priorities.length + filters.types.length + filters.tagIds.length;
};

export const isTaskMatchingFilters = (task: Task, filters: TaskFilters): boolean => {
  const isPriorityMatching =
    filters.priorities.length === 0 || filters.priorities.includes(task.priority);

  const isTypeMatching = filters.types.length === 0 || filters.types.includes(task.type);

  const isTagMatching =
    filters.tagIds.length === 0 || Boolean(task.tagId && filters.tagIds.includes(task.tagId));

  return isPriorityMatching && isTypeMatching && isTagMatching;
};
