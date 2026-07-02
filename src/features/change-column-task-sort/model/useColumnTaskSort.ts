import type { Column } from '@/entities/column'
import { useEffect, useState } from 'react'
import {
  TASK_SORT_ORDER,
  TASK_SORT_ORDER_STORAGE_KEY,
  getDefaultSortOrderByColumnId,
  parseSortOrderByColumnId,
  type TaskSortOrder,
  type TaskSortOrderByColumnId,
} from './sort'

export const useColumnTaskSort = () => {
  const [sortOrderByColumnId, setSortOrderByColumnId] = useState<TaskSortOrderByColumnId>(() => {
    const defaultValue = getDefaultSortOrderByColumnId()
    const rawValue = localStorage.getItem(TASK_SORT_ORDER_STORAGE_KEY)

    if (!rawValue) {
      return defaultValue
    }

    try {
      return {
        ...defaultValue,
        ...parseSortOrderByColumnId(JSON.parse(rawValue)),
      }
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    localStorage.setItem(TASK_SORT_ORDER_STORAGE_KEY, JSON.stringify(sortOrderByColumnId))
  }, [sortOrderByColumnId])

  const changeColumnSortOrder = (columnId: Column['id'], sortOrder: TaskSortOrder) => {
    setSortOrderByColumnId((currentValue) => ({
      ...currentValue,
      [columnId]: sortOrder,
    }))
  }

  const getColumnSortOrder = (columnId: Column['id']): TaskSortOrder =>
    sortOrderByColumnId[columnId] ?? TASK_SORT_ORDER.Newest

  return {
    sortOrderByColumnId,
    changeColumnSortOrder,
    getColumnSortOrder,
  }
}
