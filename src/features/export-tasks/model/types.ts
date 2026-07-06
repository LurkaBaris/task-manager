import type { Task } from '@/entities/task'

export const TASKS_BACKUP_VERSION = 1

export interface TasksBackup {
  version: typeof TASKS_BACKUP_VERSION
  exportedAt: string
  tasks: Task[]
}
