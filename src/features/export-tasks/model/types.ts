import type { Column } from '@/entities/column'
import type { Task } from '@/entities/task'

export const TASKS_BACKUP_VERSION = 2

export interface TasksBackup {
  version: typeof TASKS_BACKUP_VERSION
  exportedAt: string
  columns: Column[]
  tasks: Task[]
}
