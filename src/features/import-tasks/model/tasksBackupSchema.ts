import { columnSchema, DEFAULT_COLUMNS, type Column } from '@/entities/column'
import { taskSchema, type Task } from '@/entities/task'
import { z } from 'zod'
import { LEGACY_TASKS_BACKUP_VERSION, SUPPORTED_TASKS_BACKUP_VERSION } from './types'

const importedColumnSchema = columnSchema.extend({
  id: z.string().trim().min(1, 'У колонки должен быть id'),
  order: z.number().int().positive('Порядок колонки должен быть положительным числом'),
})

export const importedTaskSchema = taskSchema.extend({
  id: z.string().trim().min(1),
  createdAt: z.iso.datetime(),
  position: z.number().int().positive(),
})

const legacyBackupSchema = z
  .object({
    version: z.literal(LEGACY_TASKS_BACKUP_VERSION),
    exportedAt: z.iso.datetime(),
    tasks: z.array(importedTaskSchema),
  })
  .strict()

const currentBackupSchema = z
  .object({
    version: z.literal(SUPPORTED_TASKS_BACKUP_VERSION),
    exportedAt: z.iso.datetime(),
    columns: z.array(importedColumnSchema).min(1, 'В файле должна быть хотя бы одна колонка'),
    tasks: z.array(importedTaskSchema),
  })
  .strict()

export const tasksBackupSchema = z
  .union([legacyBackupSchema, currentBackupSchema])
  .transform((backup): { version: 2; exportedAt: string; columns: Column[]; tasks: Task[] } => {
    if (backup.version === LEGACY_TASKS_BACKUP_VERSION) {
      return {
        version: SUPPORTED_TASKS_BACKUP_VERSION,
        exportedAt: backup.exportedAt,
        columns: DEFAULT_COLUMNS.map((column) => ({ ...column })),
        tasks: backup.tasks,
      }
    }

    return backup
  })
  .superRefine((backup, ctx) => {
    const exportedAtTime = Date.parse(backup.exportedAt)
    const nowWithClockSkew = Date.now() + 60_000

    const columnIds = new Set<string>()
    const columnOrders = new Set<number>()
    const taskIds = new Set<string>()

    if (exportedAtTime > nowWithClockSkew) {
      ctx.addIssue({
        code: 'custom',
        message: 'Дата выгрузки не может быть в будущем',
        path: ['exportedAt'],
      })
    }

    backup.columns.forEach((column, index) => {
      if (columnIds.has(column.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'В файле есть повторяющиеся колонки',
          path: ['columns', index, 'id'],
        })
      }

      columnIds.add(column.id)

      if (columnOrders.has(column.order)) {
        ctx.addIssue({
          code: 'custom',
          message: 'В файле есть колонки с одинаковым порядком',
          path: ['columns', index, 'order'],
        })
      }

      columnOrders.add(column.order)
    })

    backup.tasks.forEach((task, index) => {
      if (taskIds.has(task.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'В файле есть повторяющиеся задачи',
          path: ['tasks', index, 'id'],
        })
      }

      taskIds.add(task.id)

      if (!columnIds.has(task.columnId)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Задача ссылается на колонку, которой нет в файле',
          path: ['tasks', index, 'columnId'],
        })
      }

      if (Date.parse(task.createdAt) > exportedAtTime) {
        ctx.addIssue({
          code: 'custom',
          message: 'Дата создания задачи не может быть позже даты выгрузки',
          path: ['tasks', index, 'createdAt'],
        })
      }
    })
  })
