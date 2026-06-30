import { Badge } from '@mantine/core'
import type { FC } from 'react'
import { TASK_PRIORITY_COLOR, TASK_PRIORITY_LABEL } from '../model/constants'
import type { TaskPriority } from '../model/types'

interface ITaskPriorityBadge {
  priority: TaskPriority
}

export const TaskPriorityBadge: FC<ITaskPriorityBadge> = ({ priority }) => {
  return (
    <Badge
      color={TASK_PRIORITY_COLOR[priority]}
      radius="sm"
      size="sm"
      variant="light"
    >
      {TASK_PRIORITY_LABEL[priority]}
    </Badge>
  )
}
