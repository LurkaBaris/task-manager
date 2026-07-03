import { sortTasksByPosition, type Task } from '@/entities/task'
import { TASK_SORT_ORDER, type TaskSortOrder } from '../model/sort'

export const sortTasksBySortOrder = (tasks: Task[], sortOrder: TaskSortOrder): Task[] => {
  const sortedTasks = [...tasks]

  if (sortOrder === TASK_SORT_ORDER.Manual) {
    return sortTasksByPosition(sortedTasks)
  }

  if (sortOrder === TASK_SORT_ORDER.Newest) {
    return sortedTasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  return sortedTasks.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}
