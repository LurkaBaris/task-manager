import type { Column } from '@/entities/column'
import type { Tag } from '@/entities/tag'
import type { Task } from '@/entities/task'

export const TASKS_BACKUP_VERSION = 4

export interface TasksBackupCommentAttachment {
  id: string
  name: string
  type: string
  size: number
  data: string
}

export interface TasksBackupComment {
  id: string
  taskId: string
  text: string
  createdAt: string
  attachments: TasksBackupCommentAttachment[]
}

export interface TasksBackup {
  version: typeof TASKS_BACKUP_VERSION
  exportedAt: string
  columns: Column[]
  tasks: Task[]
  tags: Tag[]
  comments: TasksBackupComment[]
}
