import { taskSchema } from '@/entities/task'
import { z } from 'zod'
import { SUPPORTED_TASKS_BACKUP_VERSION } from './types'

export const importedTaskSchema = taskSchema.extend({
  id: z.string().trim().min(1),
  createdAt: z.iso.datetime(),
  position: z.number().int().positive(),
})

export const tasksBackupSchema = z
  .object({
    version: z.literal(SUPPORTED_TASKS_BACKUP_VERSION),
    exportedAt: z.iso.datetime(),
    tasks: z.array(importedTaskSchema),
  })
  .superRefine((backup, ctx) => {
    const taskIds = new Set<string>()
    const exportedAtTime = Date.parse(backup.exportedAt)
    const nowWithClockSkew = Date.now() + 60_000

    if (exportedAtTime > nowWithClockSkew) {
      ctx.addIssue({
        code: 'custom',
        message: 'Дата выгрузки не может быть в будущем',
        path: ['exportedAt'],
      })
    }

    backup.tasks.forEach((task, index) => {
      if (taskIds.has(task.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'В файле есть задачи с одинаковым id',
          path: ['tasks', index, 'id'],
        })
      }

      taskIds.add(task.id)

      if (Date.parse(task.createdAt) > exportedAtTime) {
        ctx.addIssue({
          code: 'custom',
          message: 'Дата создания задачи не может быть позже даты выгрузки',
          path: ['tasks', index, 'createdAt'],
        })
      }
    })
  })
