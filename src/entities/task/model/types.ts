import type { Column } from '@/entities/column'

export interface Task {
  id: string
  title: string
  description: string
  createdAt: string
  columnId: Column['id']
  priority: TaskPriority
}

export type TaskPriority = 'low' | 'medium' | 'high'
