import type { Task } from '@/entities/task'
import { TASK_SORT_ORDER, type TaskSortOrder } from '@/features/change-column-task-sort'

export const sortTasksByCreatedAt = (tasks: Task[], sortOrder: TaskSortOrder): Task[] =>
  [...tasks].sort((a, b) =>
    sortOrder === TASK_SORT_ORDER.Newest
      ? b.createdAt.localeCompare(a.createdAt)
      : a.createdAt.localeCompare(b.createdAt),
  )
