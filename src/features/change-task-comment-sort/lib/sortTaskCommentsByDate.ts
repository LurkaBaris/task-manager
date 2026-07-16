import type { TaskComment } from '@/entities/task-comment'
import { TASK_COMMENT_SORT_ORDER, type TaskCommentSortOrder } from '../model/types'

export const sortTaskCommentsByDate = (
  comments: TaskComment[],
  sortOrder: TaskCommentSortOrder,
): TaskComment[] => {
  const direction = sortOrder === TASK_COMMENT_SORT_ORDER.Asc ? 1 : -1

  return [...comments].sort((firstComment, secondComment) => {
    const firstDate = new Date(firstComment.createdAt).getTime()
    const secondDate = new Date(secondComment.createdAt).getTime()

    return (firstDate - secondDate) * direction
  })
}
