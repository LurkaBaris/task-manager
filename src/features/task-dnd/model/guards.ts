import type { TaskDndColumnData, TaskDndSortableColumnData, TaskDndTaskData } from './types';

const isDndData = (data: unknown): data is { type: string } => {
  return typeof data === 'object' && data !== null && 'type' in data;
};

export const isTaskDndTaskData = (data: unknown): data is TaskDndTaskData => {
  return isDndData(data) && data.type === 'task' && 'task' in data;
};

export const isTaskDndColumnData = (data: unknown): data is TaskDndColumnData => {
  return isDndData(data) && data.type === 'column' && 'columnId' in data;
};

export const isTaskDndSortableColumnData = (data: unknown): data is TaskDndSortableColumnData => {
  return isDndData(data) && data.type === 'sortable-column' && 'column' in data;
};
