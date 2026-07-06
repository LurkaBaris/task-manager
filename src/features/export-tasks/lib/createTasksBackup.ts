import type { Task } from '@/entities/task'
import { TASKS_BACKUP_VERSION, type TasksBackup } from '../model/types'

export const createTasksBackup = (tasks: Task[]): TasksBackup => ({
  version: TASKS_BACKUP_VERSION,
  exportedAt: new Date().toISOString(),
  tasks,
})
