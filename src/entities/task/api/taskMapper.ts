import type { TaskDbRecord } from '@/shared/lib'
import { z } from 'zod'
import { taskSchema } from '../model/taskSchema'
import type { Task } from '../model/types'

const taskDbRecordSchema = taskSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  position: z.number(),
})

export const mapTaskFromDb = (record: TaskDbRecord): Task | null => {
  const result = taskDbRecordSchema.safeParse(record)

  if (!result.success) {
    console.warn('Ошибка данных в IndexedDB', result.error, record)
    return null
  }

  return result.data
}

export const mapTaskToDb = (task: Task): TaskDbRecord => ({
  id: task.id,
  title: task.title,
  description: task.description,
  createdAt: task.createdAt,
  columnId: task.columnId,
  priority: task.priority,
  position: task.position,
})
