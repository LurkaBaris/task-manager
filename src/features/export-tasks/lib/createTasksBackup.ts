import type { Column } from '@/entities/column'
import type { Task } from '@/entities/task'
import { TASKS_BACKUP_VERSION, type TasksBackup } from '../model/types'

interface CreateTasksBackupParams {
  columns: Column[]
  tasks: Task[]
}

export const createTasksBackup = ({ columns, tasks }: CreateTasksBackupParams): TasksBackup => ({
  version: TASKS_BACKUP_VERSION,
  exportedAt: new Date().toISOString(),
  columns,
  tasks,
})
