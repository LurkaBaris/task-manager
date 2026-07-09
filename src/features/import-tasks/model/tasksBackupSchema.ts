import { columnSchema, DEFAULT_COLUMNS, type Column } from '@/entities/column'
import { tagSchema, type Tag } from '@/entities/tag'
import { TASK_TYPES, taskSchema, type Task } from '@/entities/task'
import { DEFAULT_TYPE } from '@/shared/config'
import { z } from 'zod'
import {
  LEGACY_TASKS_BACKUP_VERSION,
  PREVIOUS_TASKS_BACKUP_VERSION,
  SUPPORTED_TASKS_BACKUP_VERSION,
} from './types'

const importedColumnSchema = columnSchema.extend({
  id: z.string().trim().min(1, 'У колонки должен быть id'),
  order: z.number().int().positive('Порядок колонки должен быть положительным числом'),
})

const importedTagSchema = tagSchema.extend({
  id: z.string().trim().min(1, 'У тега должен быть id'),
})

export const importedTaskSchema = taskSchema.extend({
  id: z.string().trim().min(1, 'У задачи должен быть id'),
  createdAt: z.iso.datetime('Дата создания задачи должна быть корректной'),
  position: z.number().int().positive('Позиция задачи должна быть положительным числом'),
  type: z.enum(TASK_TYPES).default(DEFAULT_TYPE),
})

const legacyBackupSchema = z
  .object({
    version: z.literal(LEGACY_TASKS_BACKUP_VERSION),
    exportedAt: z.iso.datetime(),
    tasks: z.array(importedTaskSchema),
  })
  .strict()

const previousBackupSchema = z
  .object({
    version: z.literal(PREVIOUS_TASKS_BACKUP_VERSION),
    exportedAt: z.iso.datetime(),
    columns: z.array(importedColumnSchema).min(1, 'В файле должна быть хотя бы одна колонка'),
    tasks: z.array(importedTaskSchema),
  })
  .strict()

const currentBackupSchema = z
  .object({
    version: z.literal(SUPPORTED_TASKS_BACKUP_VERSION),
    exportedAt: z.iso.datetime(),
    columns: z.array(importedColumnSchema).min(1, 'В файле должна быть хотя бы одна колонка'),
    tasks: z.array(importedTaskSchema),
    tags: z.array(importedTagSchema),
  })
  .strict()

export const tasksBackupSchema = z
  .discriminatedUnion('version', [legacyBackupSchema, previousBackupSchema, currentBackupSchema])
  .transform(
    (
      backup,
    ): {
      version: typeof SUPPORTED_TASKS_BACKUP_VERSION
      exportedAt: string
      columns: Column[]
      tasks: Task[]
      tags: Tag[]
    } => {
      if (backup.version === LEGACY_TASKS_BACKUP_VERSION) {
        return {
          version: SUPPORTED_TASKS_BACKUP_VERSION,
          exportedAt: backup.exportedAt,
          columns: DEFAULT_COLUMNS.map((column) => ({ ...column })),
          tasks: backup.tasks,
          tags: [],
        }
      }

      if (backup.version === PREVIOUS_TASKS_BACKUP_VERSION) {
        return {
          version: SUPPORTED_TASKS_BACKUP_VERSION,
          exportedAt: backup.exportedAt,
          columns: backup.columns,
          tasks: backup.tasks,
          tags: [],
        }
      }

      return backup
    },
  )
  .superRefine((backup, ctx) => {
    const exportedAtTime = Date.parse(backup.exportedAt)
    const nowWithClockSkew = Date.now() + 60_000

    const columnIds = new Set<string>()
    const columnOrders = new Set<number>()
    const taskIds = new Set<string>()
    const tagIds = new Set<string>()
    const tagNames = new Set<string>()

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

    backup.tags.forEach((tag, index) => {
      const normalizedTagName = tag.name.trim().toLowerCase()

      if (tagIds.has(tag.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'В файле есть повторяющиеся теги',
          path: ['tags', index, 'id'],
        })
      }

      tagIds.add(tag.id)

      if (tagNames.has(normalizedTagName)) {
        ctx.addIssue({
          code: 'custom',
          message: 'В файле есть теги с одинаковым названием',
          path: ['tags', index, 'name'],
        })
      }

      tagNames.add(normalizedTagName)
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

      if (task.tagId && !tagIds.has(task.tagId)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Задача ссылается на тег, которого нет в файле',
          path: ['tasks', index, 'tagId'],
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
