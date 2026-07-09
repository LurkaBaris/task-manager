import type { Column } from '@/entities/column'
import type { Tag } from '@/entities/tag'
import type { Task } from '@/entities/task'
import { tasksBackupSchema } from '../model/tasksBackupSchema'

export interface ParsedTasksBackup {
  columns: Column[]
  tasks: Task[]
  tags: Tag[]
}

export const parseTasksBackup = (fileContent: string): ParsedTasksBackup => {
  const json: unknown = JSON.parse(fileContent)
  const backup = tasksBackupSchema.parse(json)

  return {
    columns: backup.columns,
    tasks: backup.tasks,
    tags: backup.tags ?? [],
  }
}
