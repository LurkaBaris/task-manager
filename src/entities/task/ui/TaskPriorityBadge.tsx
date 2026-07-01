import { Badge } from '@mantine/core'
import { TASK_PRIORITY_COLOR, TASK_PRIORITY_LABEL } from '../model/constants'
import type { TaskPriority } from '../model/types'

interface TaskPriorityBadgeProps {
  priority: TaskPriority
}

export const TaskPriorityBadge = ({ priority }: TaskPriorityBadgeProps) => {
  return <Badge color={TASK_PRIORITY_COLOR[priority]}>{TASK_PRIORITY_LABEL[priority]}</Badge>
}
