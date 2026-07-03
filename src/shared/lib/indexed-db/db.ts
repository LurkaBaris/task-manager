import { openDB, type DBSchema } from 'idb'
import { INDEXED_DB_NAME, INDEXED_DB_VERSION } from './config'

export interface TaskDbRecord {
  id: string
  title: string
  description: string
  createdAt: string
  columnId: string
  priority: string
  position: number
}

interface AppDbSchema extends DBSchema {
  tasks: {
    key: string
    value: TaskDbRecord
    indexes: {
      'by-column-id': string
      'by-created-at': string
      'by-priority': string
    }
  }
}

const TASKS_STORE_NAME = 'tasks'
const TASK_POSITION_STEP = 1000

export const appDbPromise = openDB<AppDbSchema>(INDEXED_DB_NAME, INDEXED_DB_VERSION, {
  async upgrade(db, oldVersion, _, transaction) {
    if (oldVersion < 1) {
      const taskStore = db.createObjectStore(TASKS_STORE_NAME, { keyPath: 'id' })
      taskStore.createIndex('by-column-id', 'columnId')
      taskStore.createIndex('by-created-at', 'createdAt')
      taskStore.createIndex('by-priority', 'priority')
    }

    if (oldVersion < 2) {
      const taskStore = transaction.objectStore(TASKS_STORE_NAME)
      const positionsByColumnId = new Map<string, number>()

      try {
        let cursor = await taskStore.index('by-created-at').openCursor()

        while (cursor) {
          const task = cursor.value

          if (typeof task.position !== 'number') {
            const nextPosition = (positionsByColumnId.get(task.columnId) ?? 0) + TASK_POSITION_STEP

            positionsByColumnId.set(task.columnId, nextPosition)

            await cursor.update({
              ...task,
              position: nextPosition,
            })
          }

          cursor = await cursor.continue()
        }
      } catch (error) {
        console.error('Не удалось создать задачу', error)
      }
    }
  },
})
