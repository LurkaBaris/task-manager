import { openDB, type DBSchema } from 'idb'
import { INDEXED_DB_NAME, INDEXED_DB_VERSION } from './config'

export interface TaskDbRecord {
  id: string
  title: string
  description: string
  createdAt: string
  columnId: string
  priority: string
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

export const appDbPromise = openDB<AppDbSchema>(INDEXED_DB_NAME, INDEXED_DB_VERSION, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      const taskStore = db.createObjectStore(TASKS_STORE_NAME, { keyPath: 'id' })
      taskStore.createIndex('by-column-id', 'columnId')
      taskStore.createIndex('by-created-at', 'createdAt')
      taskStore.createIndex('by-priority', 'priority')
    }
  },
})
