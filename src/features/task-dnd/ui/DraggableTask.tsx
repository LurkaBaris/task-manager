import type { Task } from '@/entities/task'
import { useDraggable } from '@dnd-kit/core'
import type { ReactNode } from 'react'
import type { TaskDndTaskData } from '../model/types'

interface DraggableTaskProps {
  task: Task
  children: ReactNode
}

export const DraggableTask = ({ task, children }: DraggableTaskProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: {
      type: 'task',
      task,
    } satisfies TaskDndTaskData,
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        opacity: isDragging ? 0.35 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {children}
    </div>
  )
}
