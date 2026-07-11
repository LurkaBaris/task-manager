import type { TaskComment } from '../model/types'
import { taskCommentRepository } from './taskCommentRepository'

export const restoreTaskComment = (comment: TaskComment) => taskCommentRepository.restore(comment)
