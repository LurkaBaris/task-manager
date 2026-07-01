import { COLUMN_COLOR_BY_ID, COLUMN_TITLE_BY_ID } from '@/entities/column'
import { Badge } from '@mantine/core'
import type { Task } from '../model/types'

interface TaskStatusBadgeProps {
  columnId: Task['columnId']
}

export const TaskStatusBadge = ({ columnId }: TaskStatusBadgeProps) => {
  return <Badge color={COLUMN_COLOR_BY_ID[columnId]}>{COLUMN_TITLE_BY_ID[columnId]}</Badge>
}
