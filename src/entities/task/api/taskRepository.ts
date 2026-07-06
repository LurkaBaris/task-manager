import { appDbPromise } from '@/shared/lib'
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

  async putMany(tasks: Task[]): Promise<void> {
    if (tasks.length === 0) return

    const db = await appDbPromise
    const transaction = db.transaction('tasks', 'readwrite')

    await Promise.all(tasks.map((task) => transaction.store.put(mapTaskToDb(task))))

    await transaction.done
  },

  async delete(taskId: Task['id']): Promise<void> {
    await (await appDbPromise).delete('tasks', taskId)
  },

  async replaceAll(tasks: Task[]): Promise<void> {
    const db = await appDbPromise
    const transaction = db.transaction('tasks', 'readwrite')

    await transaction.store.clear()
    await Promise.all(tasks.map((task) => transaction.store.put(mapTaskToDb(task))))

    await transaction.done
  },
}
