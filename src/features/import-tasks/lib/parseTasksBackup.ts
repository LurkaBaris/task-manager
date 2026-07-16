import type { Column } from '@/entities/column'
import type { Tag } from '@/entities/tag'
import type { Task } from '@/entities/task'
import type { TaskComment } from '@/entities/task-comment'
import { tasksBackupSchema } from '../model/tasksBackupSchema'

export interface ParsedTasksBackup {
  columns: Column[]
  tasks: Task[]
  tags: Tag[]
  comments: TaskComment[]
}

export const parseTasksBackup = (fileContent: string): ParsedTasksBackup => {
  const json: unknown = JSON.parse(fileContent)
  const backup = tasksBackupSchema.parse(json)

  return {
    columns: backup.columns,
    tasks: backup.tasks,
    tags: backup.tags,
    comments: backup.comments,
  }
}
