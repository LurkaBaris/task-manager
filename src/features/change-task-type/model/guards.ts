import { TASK_TYPE_OPTIONS, type TaskType } from '@/entities/task'

export const isTaskType = (value: string): value is TaskType => {
  return TASK_TYPE_OPTIONS.some((option) => option.value === value)
}
