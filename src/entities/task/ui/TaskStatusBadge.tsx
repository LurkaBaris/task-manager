import { Badge } from '@mantine/core'
import type { FC } from 'react'
import { TASK_STATUS_COLOR, TASK_STATUS_LABEL } from '../model/constants'
import type { TaskStatus } from '../model/types'

interface ITaskStatusBadge {
  status: TaskStatus
}

export const TaskStatusBadge: FC<ITaskStatusBadge> = ({ status }) => {
  return (
    <Badge
      color={TASK_STATUS_COLOR[status]}
      radius="sm"
      size="sm"
      variant="light"
    >
      {TASK_STATUS_LABEL[status]}
    </Badge>
  )
}
