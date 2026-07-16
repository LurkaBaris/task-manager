import type { TaskComment } from '../model/types'
import { taskCommentRepository } from './taskCommentRepository'

export const deleteTaskComment = (commentId: TaskComment['id']) =>
  taskCommentRepository.delete(commentId)
