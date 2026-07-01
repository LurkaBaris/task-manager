import type { TaskSchemaType } from './taskSchema'
import type { Task } from './types'

export const createTask = (data: TaskSchemaType): Task => {
  const newTask: Task = {
    id: `task-${window.crypto.randomUUID()}`,
    title: data.title,
    description: data.description,
    columnId: data.columnId,
    priority: data.priority,
    createdAt: new Date().toISOString(),
  }

  return newTask
}
