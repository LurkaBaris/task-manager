import type { Column } from '@/entities/column'
import type { Task } from '@/entities/task'

export const SORTABLE_COLUMN_ID_PREFIX = 'sortable-column:'
export const DROPPABLE_COLUMN_ID_PREFIX = 'droppable-column:'
export const SORTABLE_TASK_ID_PREFIX = 'sortable-task:'

export interface TaskDndTaskData {
  type: 'task'
  task: Task
}

export interface TaskDndColumnData {
  type: 'column'
  columnId: Task['columnId']
}

export interface TaskDndSortableColumnData {
  type: 'sortable-column'
  column: Column
}

export type TaskDndData = TaskDndTaskData | TaskDndColumnData | TaskDndSortableColumnData
