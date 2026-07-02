import { DEFAULT_COLUMNS, type Column } from '@/entities/column'

export const TASK_SORT_ORDER = {
  Newest: 'newest',
  Oldest: 'oldest',
} as const

export type TaskSortOrder = (typeof TASK_SORT_ORDER)[keyof typeof TASK_SORT_ORDER]
export type TaskSortOrderByColumnId = Partial<Record<Column['id'], TaskSortOrder>>

export const TASK_SORT_ORDER_STORAGE_KEY = 'task-board:sort-order-by-column-id'

export const getDefaultSortOrderByColumnId = (): TaskSortOrderByColumnId =>
  Object.fromEntries(DEFAULT_COLUMNS.map((column) => [column.id, TASK_SORT_ORDER.Newest]))

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isTaskSortOrder = (value: unknown): value is TaskSortOrder =>
  Object.values(TASK_SORT_ORDER).some((sortOrder) => sortOrder === value)

export const parseSortOrderByColumnId = (value: unknown): TaskSortOrderByColumnId => {
  if (!isRecord(value)) {
    return {}
  }

  const sortOrderByColumnId: TaskSortOrderByColumnId = {}

  DEFAULT_COLUMNS.forEach((column) => {
    const sortOrder = value[column.id]

    if (isTaskSortOrder(sortOrder)) {
      sortOrderByColumnId[column.id] = sortOrder
    }
  })

  return sortOrderByColumnId
}
