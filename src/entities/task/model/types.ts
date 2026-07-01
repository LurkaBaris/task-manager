import type { Column } from '@/entities/column'
import type { TASK_PRIORITY_CONFIG } from './constants'

export type TaskPriorityConfig = (typeof TASK_PRIORITY_CONFIG)[number]

export type TaskPriority = TaskPriorityConfig['id']

export interface Task {
  id: string
  title: string
  description: string
  createdAt: string
  columnId: Column['id']
  priority: TaskPriority
}
