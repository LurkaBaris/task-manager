import type { Tag } from '@/entities/tag'
import type { TaskPriority, TaskType } from '@/entities/task'

export interface TaskFilters {
  priorities: TaskPriority[]
  types: TaskType[]
  tagIds: Tag['id'][]
}
