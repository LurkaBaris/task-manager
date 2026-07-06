import type { Column } from '@/entities/column'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'
import { SORTABLE_COLUMN_ID_PREFIX, type TaskDndSortableColumnData } from '../model/types'
import styles from './SortableColumn.module.css'

interface SortableColumnProps {
  column: Column
  disabled?: boolean
  children: ReactNode
}

export const SortableColumn = ({ column, disabled = false, children }: SortableColumnProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${SORTABLE_COLUMN_ID_PREFIX}${column.id}`,
    disabled,
    data: {
      type: 'sortable-column',
      column,
    } satisfies TaskDndSortableColumnData,
  })

  return (
    <div
      ref={setNodeRef}
      className={styles.draggable}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
        opacity: isDragging ? 0.35 : 1,
      }}
    >
      <button
        ref={setActivatorNodeRef}
        className={styles.dragHandle}
        type="button"
        aria-label="Перетащить колонку"
        disabled={disabled}
        {...attributes}
        {...listeners}
      />

      {children}
    </div>
  )
}
