import type { Task } from '@/entities/task'
import { tasksBackupSchema } from '../model/tasksBackupSchema'

export interface ParsedTasksBackup {
  tasks: Task[]
}

export const parseTasksBackup = (fileContent: string): ParsedTasksBackup => {
  const json: unknown = JSON.parse(fileContent)
  const backup = tasksBackupSchema.parse(json)

  return {
    tasks: backup.tasks,
  }
}
