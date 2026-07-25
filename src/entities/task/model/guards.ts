import { TASK_PRIORITIES, TASK_TYPES } from './constants';
import type { TaskPriority, TaskType } from './types';

export const isTaskPriority = (value: unknown): value is TaskPriority => {
  return TASK_PRIORITIES.some((priority) => priority === value);
};

export const isTaskType = (value: unknown): value is TaskType => {
  return TASK_TYPES.some((type) => type === value);
};
