import type { Column } from '@/entities/column'
import type { Tag } from '@/entities/tag'
import type { TASK_PRIORITY_CONFIG, TASK_TYPE_CONFIG } from './constants'

export type TaskPriorityConfig = (typeof TASK_PRIORITY_CONFIG)[number]
export type TaskPriority = TaskPriorityConfig['id']

export type TaskTypeConfig = (typeof TASK_TYPE_CONFIG)[number]
export type TaskType = TaskTypeConfig['id']

export interface Task {
  id: string
  title: string
  description: string
  createdAt: string
  columnId: Column['id']
  priority: TaskPriority
  position: number
  type: TaskType
  tagId?: Tag['id']
}

export type TasksByColumnId = Partial<Record<Task['columnId'], Task[]>>
