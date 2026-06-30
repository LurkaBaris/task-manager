import type { TaskPriority, TaskStatus } from './types'

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  inProgress: 'В работе',
  done: 'Готово',
}

export const TASK_STATUS_COLOR: Record<TaskStatus, string> = {
  todo: 'blue',
  inProgress: 'yellow',
  done: 'green',
}

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}

export const TASK_PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: 'green',
  medium: 'yellow',
  high: 'red',
}
