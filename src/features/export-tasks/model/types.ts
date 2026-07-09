import type { Column } from '@/entities/column'
import type { Tag } from '@/entities/tag'
import type { Task } from '@/entities/task'

export const TASKS_BACKUP_VERSION = 3

export interface TasksBackup {
  version: typeof TASKS_BACKUP_VERSION
  exportedAt: string
  columns: Column[]
  tasks: Task[]
  tags: Tag[]
}
