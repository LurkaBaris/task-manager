import type { Column } from '@/entities/column'
import { useDroppable } from '@dnd-kit/core'
import type { ReactNode } from 'react'
import type { TaskDndColumnData } from '../model/types'

interface DroppableColumnProps {
  columnId: Column['id']
  children: (props: { setNodeRef: (element: HTMLElement | null) => void }) => ReactNode
}

export const DroppableColumn = ({ columnId, children }: DroppableColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: columnId,
    data: {
      type: 'column',
      columnId,
    } satisfies TaskDndColumnData,
  })

  return children({ setNodeRef })
}
