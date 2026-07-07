import { selectColumns, useColumnStore } from '@/entities/column'
import { Badge } from '@mantine/core'
import { useShallow } from 'zustand/shallow'
import type { Task } from '../model/types'

interface TaskStatusBadgeProps {
  columnId: Task['columnId']
}

export const TaskStatusBadge = ({ columnId }: TaskStatusBadgeProps) => {
  const { columns } = useColumnStore(useShallow(selectColumns))

  const column = columns.find((column) => column.id === columnId)

  return (
    <Badge color={column?.color ?? 'gray'} data-no-dnd>
      {column?.title ?? 'Колонка удалена'}
    </Badge>
  )
}
