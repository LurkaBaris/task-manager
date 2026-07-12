import type { TaskComment } from '../model/types'
import { taskCommentRepository } from './taskCommentRepository'

export const getTaskCommentsByTaskIds = (taskIds: TaskComment['taskId'][]) =>
  taskCommentRepository.getByTaskIds(taskIds)
