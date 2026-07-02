// features/task-dnd/ui/TaskDndProvider.tsx

import { useTaskActions, type Task } from '@/entities/task'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { notifications } from '@mantine/notifications'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { isTaskDndActiveData, isTaskDndOverData } from '../model/guards'

interface TaskDndProviderProps {
  children: ReactNode
  renderOverlay: (task: Task) => ReactNode
}

export const TaskDndProvider = ({ children, renderOverlay }: TaskDndProviderProps) => {
  const { updateTask } = useTaskActions()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 6,
    },
  })

  const handleDragStart = ({ active }: DragStartEvent) => {
    const activeData = active.data.current

    if (!isTaskDndActiveData(activeData)) return

    setActiveTask(activeData.task)
  }

  const handleDragCancel = () => {
    setActiveTask(null)
  }

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveTask(null)

    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    if (!isTaskDndActiveData(activeData) || !isTaskDndOverData(overData)) return

    const task = activeData.task
    const targetColumnId = overData.columnId

    if (task.columnId === targetColumnId) return

    try {
      await updateTask(task.id, { columnId: targetColumnId })

      notifications.show({
        title: 'Задача перемещена',
        message: 'Изменения сохранены',
        color: 'brand',
      })
    } catch {
      notifications.show({
        title: 'Не удалось переместить задачу',
        message: 'Попробуйте перетащить задачу еще раз',
        color: 'red',
      })
    }
  }

  return (
    <DndContext
      sensors={[pointerSensor]}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      {children}

      <DragOverlay dropAnimation={null}>
        {activeTask ? renderOverlay(activeTask) : null}
      </DragOverlay>
    </DndContext>
  )
}
