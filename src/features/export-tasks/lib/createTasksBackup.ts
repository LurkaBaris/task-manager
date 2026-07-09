import type { Column } from '@/entities/column'
import type { Tag } from '@/entities/tag'
import type { Task } from '@/entities/task'
import { TASKS_BACKUP_VERSION, type TasksBackup } from '../model/types'

interface CreateTasksBackupParams {
  columns: Column[]
  tasks: Task[]
  tags: Tag[]
}

export const createTasksBackup = ({
  columns,
  tasks,
  tags,
}: CreateTasksBackupParams): TasksBackup => ({
  version: TASKS_BACKUP_VERSION,
  exportedAt: new Date().toISOString(),
  columns,
  tasks,
  tags,
})
