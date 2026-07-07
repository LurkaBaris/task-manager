import type { TaskPriority } from './types'

export const TASK_PRIORITY_CONFIG = [
  { id: 'low', title: 'Низкий', color: 'priorityLow' },
  { id: 'medium', title: 'Средний', color: 'priorityMedium' },
  { id: 'high', title: 'Высокий', color: 'priorityHigh' },
] as const

export const TASK_PRIORITIES = TASK_PRIORITY_CONFIG.map(({ id }) => id)

export const TASK_PRIORITY_SELECT_DATA = TASK_PRIORITY_CONFIG.map(({ id, title }) => ({
  value: id,
  label: title,
}))

export const TASK_PRIORITY_COLOR = Object.fromEntries(
  TASK_PRIORITY_CONFIG.map(({ id, color }) => [id, color]),
) as Record<TaskPriority, string>
