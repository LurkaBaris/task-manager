export const LEGACY_TASKS_BACKUP_VERSION = 1
export const PREVIOUS_TASKS_BACKUP_VERSION = 2
export const TAGS_TASKS_BACKUP_VERSION = 3
export const SUPPORTED_TASKS_BACKUP_VERSION = 4

export const IMPORT_TASKS_MODE = {
  Merge: 'merge',
  Replace: 'replace',
} as const

export type ImportTasksMode = (typeof IMPORT_TASKS_MODE)[keyof typeof IMPORT_TASKS_MODE]
