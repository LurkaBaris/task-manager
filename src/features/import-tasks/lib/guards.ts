import { IMPORT_TASKS_MODES, type ImportTasksMode } from '@/entities/task'

export const isImportTasksMode = (value: string): value is ImportTasksMode =>
  IMPORT_TASKS_MODES.includes(value as ImportTasksMode)
