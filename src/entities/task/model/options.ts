import { TASK_PRIORITY_LABEL } from './constants'

export const TASK_PRIORITY_OPTIONS = Object.entries(TASK_PRIORITY_LABEL).map(([value, label]) => ({
  value,
  label,
}))
