import { appDbPromise } from '@/shared/lib'
import { sortTaskCommentsByCreatedAt } from '../lib/helpers'
import type { TaskComment } from '../model/types'

const TASK_COMMENTS_STORE_NAME = 'taskComments'

const putTaskCommentRecord = async (comment: TaskComment): Promise<void> => {
  const db = await appDbPromise

  await db.put(TASK_COMMENTS_STORE_NAME, comment)
}

export const taskCommentRepository = {
  async getAll(): Promise<TaskComment[]> {
    const db = await appDbPromise
    const comments = await db.getAll(TASK_COMMENTS_STORE_NAME)

    return sortTaskCommentsByCreatedAt(comments)
  },

  async getByTaskId(taskId: TaskComment['taskId']): Promise<TaskComment[]> {
    const db = await appDbPromise
    const comments = await db.getAllFromIndex(TASK_COMMENTS_STORE_NAME, 'by-task-id', taskId)

    return sortTaskCommentsByCreatedAt(comments)
  },

  async put(comment: TaskComment): Promise<void> {
    await putTaskCommentRecord(comment)
  },

  async restore(comment: TaskComment): Promise<void> {
    await putTaskCommentRecord(comment)
  },

  async restoreMany(comments: TaskComment[]): Promise<void> {
    const db = await appDbPromise
    const transaction = db.transaction(TASK_COMMENTS_STORE_NAME, 'readwrite')

    await Promise.all(comments.map((comment) => transaction.store.put(comment)))
    await transaction.done
  },

  async delete(commentId: TaskComment['id']): Promise<void> {
    const db = await appDbPromise

    await db.delete(TASK_COMMENTS_STORE_NAME, commentId)
  },

  async deleteByTaskId(taskId: TaskComment['taskId']): Promise<void> {
    const db = await appDbPromise
    const transaction = db.transaction(TASK_COMMENTS_STORE_NAME, 'readwrite')
    const taskIdIndex = transaction.store.index('by-task-id')
    let cursor = await taskIdIndex.openCursor(taskId)

    while (cursor) {
      await cursor.delete()
      cursor = await cursor.continue()
    }

    await transaction.done
  },
}
