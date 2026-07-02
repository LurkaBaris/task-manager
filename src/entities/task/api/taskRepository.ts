import { appDbPromise } from '@/shared/lib/indexed-db'
import type { Task } from '../model/types'
import { mapTaskFromDb, mapTaskToDb } from './taskMapper'

export const taskRepository = {
  async getAll(): Promise<Task[]> {
    const db = await appDbPromise
    const records = await db.getAll('tasks')

    return records.map(mapTaskFromDb).filter((task): task is Task => task !== null)
  },

  async getByColumnId(columnId: Task['columnId']): Promise<Task[]> {
    const db = await appDbPromise
    const records = await db.getAllFromIndex('tasks', 'by-column-id', columnId)

    return records.map(mapTaskFromDb).filter((task): task is Task => task !== null)
  },

  async put(task: Task): Promise<void> {
    await (await appDbPromise).put('tasks', mapTaskToDb(task))
  },

  async delete(taskId: Task['id']): Promise<void> {
    await (await appDbPromise).delete('tasks', taskId)
  },
}
