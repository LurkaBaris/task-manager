import type { Task } from '@/entities/task'

export interface TaskDndTaskData {
  type: 'task'
  task: Task
}

export interface TaskDndColumnData {
  type: 'column'
  columnId: Task['columnId']
}

export type TaskDndData = TaskDndTaskData | TaskDndColumnData
