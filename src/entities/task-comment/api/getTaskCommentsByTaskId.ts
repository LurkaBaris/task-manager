import type { TaskComment } from '../model/types'
import { taskCommentRepository } from './taskCommentRepository'

export const getTaskCommentsByTaskId = (taskId: TaskComment['taskId']) =>
  taskCommentRepository.getByTaskId(taskId)
