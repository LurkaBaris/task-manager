import type { Column } from '@/entities/column'
import type { Task } from '@/entities/task'
import { tasksBackupSchema } from '../model/tasksBackupSchema'

export interface ParsedTasksBackup {
  columns: Column[]
  tasks: Task[]
}

export const parseTasksBackup = (fileContent: string): ParsedTasksBackup => {
  const json: unknown = JSON.parse(fileContent)
  const backup = tasksBackupSchema.parse(json)

  return {
    columns: backup.columns,
    tasks: backup.tasks,
  }
}
