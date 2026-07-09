import { DEFAULT_COLUMNS, DEFAULT_TYPE, TASK_POSITION_STEP } from '@/shared/config'
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
  type: string
  tagId?: string
}

export interface ColumnDbRecord {
  id: string
  title: string
  color: string
  order: number
}

export interface TagDbRecord {
  id: string
  name: string
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
  columns: {
    key: string
    value: ColumnDbRecord
    indexes: {
      'by-order': number
    }
  }
  tags: {
    key: string
    value: TagDbRecord
  }
}

const TASKS_STORE_NAME = 'tasks'
const COLUMNS_STORE_NAME = 'columns'
const TAGS_STORE_NAME = 'tags'

const UNUSED_TASK_INDEXES: Array<'by-created-at' | 'by-priority'> = ['by-created-at', 'by-priority']

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
        console.error('Не удалось определить позицию задачи', error)
      }
    }

    if (oldVersion < 3) {
      const taskStore = transaction.objectStore(TASKS_STORE_NAME)

      for (const indexName of UNUSED_TASK_INDEXES) {
        if (taskStore.indexNames.contains(indexName)) {
          taskStore.deleteIndex(indexName)
        }
      }
    }

    if (oldVersion < 4) {
      const columnStore = db.createObjectStore(COLUMNS_STORE_NAME, { keyPath: 'id' })

      columnStore.createIndex('by-order', 'order')

      for (const column of DEFAULT_COLUMNS) {
        await columnStore.put(column)
      }
    }

    if (oldVersion < 5) {
      db.createObjectStore(TAGS_STORE_NAME, { keyPath: 'id' })

      const taskStore = transaction.objectStore(TASKS_STORE_NAME)

      let cursor = await taskStore.openCursor()

      while (cursor) {
        const task = cursor.value

        await cursor.update({
          ...task,
          type: task.type || DEFAULT_TYPE,
          tagId: undefined,
        })

        cursor = await cursor.continue()
      }
    }
  },
})
