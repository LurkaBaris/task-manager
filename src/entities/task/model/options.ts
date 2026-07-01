import { TASK_PRIORITY_CONFIG } from './constants'

export const TASK_PRIORITY_OPTIONS = TASK_PRIORITY_CONFIG.map(({ id, title }) => ({
  value: id,
  label: title,
}))
