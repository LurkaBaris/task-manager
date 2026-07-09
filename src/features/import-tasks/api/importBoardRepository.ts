import { mapColumnToDb, type Column } from '@/entities/column'
import { mapTagToDb, type Tag } from '@/entities/tag'
import { mapTaskToDb, type Task } from '@/entities/task'
import { appDbPromise } from '@/shared/lib'

interface ReplaceBoardParams {
  columns: Column[]
  tasks: Task[]
  tags: Tag[]
}

export const importBoardRepository = {
  async replaceBoard({ columns, tasks, tags }: ReplaceBoardParams): Promise<void> {
    const db = await appDbPromise
    const transaction = db.transaction(['columns', 'tags', 'tasks'], 'readwrite')

    const columnStore = transaction.objectStore('columns')
    const tagStore = transaction.objectStore('tags')
    const taskStore = transaction.objectStore('tasks')

    await columnStore.clear()
    await tagStore.clear()
    await taskStore.clear()

    for (const column of columns) {
      await columnStore.put(mapColumnToDb(column))
    }

    for (const tag of tags) {
      await tagStore.put(mapTagToDb(tag))
    }

    for (const task of tasks) {
      await taskStore.put(mapTaskToDb(task))
    }

    await transaction.done
  },
}
