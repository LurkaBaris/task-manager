import type { Column } from '@/entities/column'

export interface Task {
  id: string
  columnId: Column['id']
  title: string
  description: string
  createdAt: string
  status: TaskStatus
  priority: TaskPriority
}

export type TaskStatus = 'todo' | 'inProgress' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high'
