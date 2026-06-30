import type { TaskPriority } from './types'

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}

export const TASK_PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: 'priorityLow',
  medium: 'priorityMedium',
  high: 'priorityHigh',
}
