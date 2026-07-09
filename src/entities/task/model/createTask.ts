import type { TaskSchemaType } from './taskSchema'
import type { Task } from './types'

interface ICreateTaskSchema extends TaskSchemaType {
  position: number
}

export const createTask = (data: ICreateTaskSchema): Task => {
  const newTask: Task = {
    id: `task-${window.crypto.randomUUID()}`,
    title: data.title,
    description: data.description,
    columnId: data.columnId,
    priority: data.priority,
    type: data.type,
    tagId: data.tagId,
    createdAt: new Date().toISOString(),
    position: data.position,
  }

  return newTask
}
