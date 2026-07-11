import type { Column } from '@/entities/column'
import type { Tag } from '@/entities/tag'
import type { Task } from '@/entities/task'
import type { TaskComment } from '@/entities/task-comment'
import { uint8ArrayToBase64 } from 'uint8array-extras'
import { TASKS_BACKUP_VERSION, type TasksBackup } from '../model/types'

interface CreateTasksBackupParams {
  columns: Column[]
  tasks: Task[]
  tags: Tag[]
  comments: TaskComment[]
}

const encodeBlobToBase64 = async (blob: Blob): Promise<string> => {
  const bytes = new Uint8Array(await blob.arrayBuffer())

  return uint8ArrayToBase64(bytes)
}

export const createTasksBackup = async ({
  columns,
  tasks,
  tags,
  comments,
}: CreateTasksBackupParams): Promise<TasksBackup> => {
  const serializedComments = await Promise.all(
    comments.map(async (comment) => ({
      id: comment.id,
      taskId: comment.taskId,
      text: comment.text,
      createdAt: comment.createdAt,
      attachments: await Promise.all(
        comment.attachments.map(async (attachment) => ({
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
          size: attachment.size,
          data: await encodeBlobToBase64(attachment.file),
        })),
      ),
    })),
  )

  return {
    version: TASKS_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    columns,
    tasks,
    tags,
    comments: serializedComments,
  }
}
