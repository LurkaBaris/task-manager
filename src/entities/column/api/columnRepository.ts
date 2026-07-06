import type { Task } from '@/entities/task'
import { mapTaskToDb } from '@/entities/task/api/taskMapper'
import { appDbPromise } from '@/shared/lib'
import type { Column } from '../model/types'

export const columnRepository = {
  async getAll(): Promise<Column[]> {
    const db = await appDbPromise
    return db.getAllFromIndex('columns', 'by-order')
  },

  async put(column: Column): Promise<void> {
    const db = await appDbPromise

    await db.put('columns', column)
  },

  async putMany(columns: Column[]): Promise<void> {
    const db = await appDbPromise
    const transaction = db.transaction('columns', 'readwrite')

    await transaction.store.clear()
    await Promise.all(columns.map((column) => transaction.store.put(column)))

    await transaction.done
  },

  async deleteWithTasks(columnId: Column['id']): Promise<void> {
    const db = await appDbPromise
    const transaction = db.transaction(['columns', 'tasks'], 'readwrite')
    const columnStore = transaction.objectStore('columns')
    const taskStore = transaction.objectStore('tasks')

    await columnStore.delete(columnId)

    let cursor = await taskStore.index('by-column-id').openCursor(columnId)

    while (cursor) {
      await cursor.delete()
      cursor = await cursor.continue()
    }

    await transaction.done
  },

  async replaceBoard({ columns, tasks }: { columns: Column[]; tasks: Task[] }): Promise<void> {
    const db = await appDbPromise
    const transaction = db.transaction(['columns', 'tasks'], 'readwrite')
    const columnStore = transaction.objectStore('columns')
    const taskStore = transaction.objectStore('tasks')

    await columnStore.clear()
    await taskStore.clear()
    await Promise.all([
      ...columns.map((column) => columnStore.put(column)),
      ...tasks.map((task) => taskStore.put(mapTaskToDb(task))),
    ])

    await transaction.done
  },
}
