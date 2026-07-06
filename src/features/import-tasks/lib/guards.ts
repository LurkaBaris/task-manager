import type { ImportTasksMode } from '@/entities/task'

export const isImportTasksMode = (value: string): value is ImportTasksMode =>
  value === 'merge' || value === 'replace'
