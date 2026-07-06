import { useTaskActions, type Task } from '@/entities/task'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { notifications } from '@mantine/notifications'
import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import {
  findTaskColumnId,
  getTaskDndNextTasksByColumnId,
  getTaskDndTargetColumnId,
  getTaskDndTouchedColumns,
  hasTaskDndOrderChanged,
  makeTasksSnapshot,
  type TasksByColumnId,
} from '../lib/taskDndState'
import { isTaskDndTaskData } from '../model/guards'
import styles from './TaskDndProvider.module.css'

interface TaskDndProviderProps {
  children: (props: {
    overColumnId: Task['columnId'] | null
    getColumnTasks: (columnId: Task['columnId']) => Task[]
  }) => ReactNode
  renderOverlay: (task: Task) => ReactNode
  columnIds: Task['columnId'][]
  getColumnTasks: (columnId: Task['columnId']) => Task[]
  isColumnManual: (columnId: Task['columnId']) => boolean
  setColumnManual: (columnId: Task['columnId']) => void
  disabled?: boolean
}

const shouldInsertTaskAfter = (
  active: DragOverEvent['active'],
  over: NonNullable<DragOverEvent['over']>,
) => {
  const activeRect = active.rect.current.translated ?? active.rect.current.initial

  if (!activeRect) {
    return false
  }

  return activeRect.top > over.rect.top + over.rect.height / 2
}

export const TaskDndProvider = ({
  children,
  renderOverlay,
  columnIds,
  getColumnTasks,
  isColumnManual,
  setColumnManual,
  disabled,
}: TaskDndProviderProps) => {
  const { moveTask, reorderColumnTasks } = useTaskActions()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const activeTaskRef = useRef<Task | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
  )
  const [overColumnId, setOverColumnId] = useState<Task['columnId'] | null>(null)
  const [draftTasksByColumnId, setDraftTasksByColumnId] = useState<TasksByColumnId | null>(null)

  const resetDragState = () => {
    activeTaskRef.current = null
    setActiveTask(null)
    setOverColumnId(null)
    setDraftTasksByColumnId(null)
  }

  const getTasksSnapshot = (): TasksByColumnId => makeTasksSnapshot(columnIds, getColumnTasks)

  const getVisibleColumnTasks = (columnId: Task['columnId']) =>
    draftTasksByColumnId?.[columnId] ?? getColumnTasks(columnId)

  const handleDragStart = ({ active }: DragStartEvent) => {
    if (disabled) return

    const activeData = active.data.current
    if (!isTaskDndTaskData(activeData)) return

    activeTaskRef.current = activeData.task
    setActiveTask(activeData.task)
    setDraftTasksByColumnId(getTasksSnapshot())
  }

  const handleDragCancel = () => {
    resetDragState()
  }

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const draggedTask = activeTaskRef.current

    if (disabled || !over || !draggedTask) {
      setOverColumnId(null)
      return
    }

    const overData = over.data.current

    const visibleTasksByColumnId = draftTasksByColumnId ?? getTasksSnapshot()
    const targetColumnId = getTaskDndTargetColumnId(columnIds, visibleTasksByColumnId, overData)

    if (!targetColumnId) {
      setOverColumnId(null)
      return
    }

    setOverColumnId((current) => (current === targetColumnId ? current : targetColumnId))

    setDraftTasksByColumnId((current) => {
      const tasksByColumnId = current ?? getTasksSnapshot()
      const sourceColumnId = findTaskColumnId(columnIds, tasksByColumnId, draggedTask.id)

      if (!sourceColumnId) {
        return tasksByColumnId
      }

      const nextTasksByColumnId = getTaskDndNextTasksByColumnId({
        tasksByColumnId,
        task: draggedTask,
        sourceColumnId,
        targetColumnId,
        overTask: isTaskDndTaskData(overData) ? overData.task : undefined,
        insertAfter: shouldInsertTaskAfter(active, over),
      })

      return hasTaskDndOrderChanged({
        tasksByColumnId,
        nextTasksByColumnId,
        sourceColumnId,
        targetColumnId,
      })
        ? nextTasksByColumnId
        : tasksByColumnId
    })
  }

  const handleDragEnd = async ({ over }: DragEndEvent) => {
    const draggedTask = activeTaskRef.current

    if (disabled || !over || !draggedTask) {
      resetDragState()
      return
    }

    const overData = over.data.current

    const sourceColumnId = draggedTask.columnId
    const tasksSnapshot = getTasksSnapshot()
    const nextTasksByColumnId = draftTasksByColumnId ?? tasksSnapshot
    const targetColumnId =
      findTaskColumnId(columnIds, nextTasksByColumnId, draggedTask.id) ??
      getTaskDndTargetColumnId(columnIds, nextTasksByColumnId, overData)

    if (!targetColumnId) {
      resetDragState()
      return
    }

    if (
      !hasTaskDndOrderChanged({
        tasksByColumnId: tasksSnapshot,
        nextTasksByColumnId,
        sourceColumnId,
        targetColumnId,
      })
    ) {
      resetDragState()
      return
    }

    const targetTasks = nextTasksByColumnId[targetColumnId] ?? []
    const movedTaskIndex = targetTasks.findIndex((task) => task.id === draggedTask.id)

    if (movedTaskIndex === -1) {
      resetDragState()
      return
    }

    try {
      const sourceIsManual = isColumnManual(sourceColumnId)
      const targetIsManual = isColumnManual(targetColumnId)

      if (sourceIsManual && targetIsManual) {
        await moveTask({
          task: draggedTask,
          targetColumnId,
          previousTask: targetTasks[movedTaskIndex - 1],
          nextTask: targetTasks[movedTaskIndex + 1],
        })
      } else {
        await reorderColumnTasks({
          columns: getTaskDndTouchedColumns({
            tasksByColumnId: nextTasksByColumnId,
            taskId: draggedTask.id,
            sourceColumnId,
            targetColumnId,
          }),
        })

        if (!sourceIsManual) {
          setColumnManual(sourceColumnId)
        }

        if (sourceColumnId !== targetColumnId && !targetIsManual) {
          setColumnManual(targetColumnId)
        }
      }

      notifications.show({
        title: `Перемещена задача «${draggedTask.title}»`,
        message: 'Изменения сохранены',
        color: 'brand',
      })
    } catch {
      notifications.show({
        title: `Не удалось переместить задачу «${draggedTask.title}»`,
        message: 'Попробуйте перетащить задачу еще раз',
        color: 'red',
      })
    } finally {
      resetDragState()
    }
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children({ overColumnId, getColumnTasks: getVisibleColumnTasks })}

      <DragOverlay dropAnimation={null}>
        {activeTask ? <div className={styles.overlay}>{renderOverlay(activeTask)}</div> : null}
      </DragOverlay>
    </DndContext>
  )
}
