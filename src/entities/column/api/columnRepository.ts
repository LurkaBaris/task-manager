import { appDbPromise } from '@/shared/lib'
import type { Column } from '../model/types'
import { mapColumnFromDb, mapColumnToDb } from './columnMapper'

export const columnRepository = {
  async getAll(): Promise<Column[]> {
    const db = await appDbPromise
    const records = await db.getAllFromIndex('columns', 'by-order')

    return records.map(mapColumnFromDb).filter((column): column is Column => column !== null)
  },

  async put(column: Column): Promise<void> {
    const db = await appDbPromise

    await db.put('columns', mapColumnToDb(column))
  },

  async putMany(columns: Column[]): Promise<void> {
    const db = await appDbPromise
    const transaction = db.transaction('columns', 'readwrite')

    await transaction.store.clear()
    await Promise.all(columns.map((column) => transaction.store.put(mapColumnToDb(column))))

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
}
