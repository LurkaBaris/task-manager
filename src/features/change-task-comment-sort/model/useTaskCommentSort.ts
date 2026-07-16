import { useEffect, useState } from 'react'
import { isTaskCommentSortOrder, TASK_COMMENT_SORT_ORDER, type TaskCommentSortOrder } from './types'

const TASK_COMMENT_SORT_STORAGE_KEY = 'task-comment-sort-order'

const getStoredSortOrder = (): TaskCommentSortOrder => {
  const storedSortOrder = localStorage.getItem(TASK_COMMENT_SORT_STORAGE_KEY)

  return isTaskCommentSortOrder(storedSortOrder) ? storedSortOrder : TASK_COMMENT_SORT_ORDER.Asc
}

export const useTaskCommentSort = () => {
  const [sortOrder, setSortOrder] = useState<TaskCommentSortOrder>(getStoredSortOrder)

  useEffect(() => {
    localStorage.setItem(TASK_COMMENT_SORT_STORAGE_KEY, sortOrder)
  }, [sortOrder])

  const toggleSortOrder = () => {
    setSortOrder((currentSortOrder) =>
      currentSortOrder === TASK_COMMENT_SORT_ORDER.Asc
        ? TASK_COMMENT_SORT_ORDER.Desc
        : TASK_COMMENT_SORT_ORDER.Asc,
    )
  }

  return { sortOrder, toggleSortOrder }
}
