import { useColumnActions, type Column } from '@/entities/column'
import { useTaskActions, type Task, type TasksByColumnId } from '@/entities/task'
import {
  closestCenter,
  closestCorners,
  DndContext,
  DragOverlay,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { arrayMove } from '@dnd-kit/sortable'
import { notifications } from '@mantine/notifications'
import type { ReactNode } from 'react'
import { useMemo, useRef, useState } from 'react'
import {
  findTaskColumnId,
  getTaskDndNextTasksByColumnId,
  getTaskDndTargetColumnId,
  getTaskDndTouchedColumns,
  hasTaskDndOrderChanged,
  makeTasksSnapshot,
} from '../lib/taskDndState'
import {
  isTaskDndColumnData,
  isTaskDndSortableColumnData,
  isTaskDndTaskData,
} from '../model/guards'
import { CustomPointerSensor, CustomTouchSensor } from '../model/sensors'
import styles from './TaskDndProvider.module.css'

interface TaskDndProviderProps {
  children: (props: {
    overColumnId: Task['columnId'] | null
    getColumnTasks: (columnId: Task['columnId']) => Task[]
  }) => ReactNode
  renderOverlay: (task: Task) => ReactNode
  columns: Column[]
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
  columns,
  getColumnTasks,
  isColumnManual,
  setColumnManual,
  disabled,
}: TaskDndProviderProps) => {
  const { moveTask, reorderColumnTasks } = useTaskActions()
  const { reorderColumns } = useColumnActions()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const activeTaskRef = useRef<Task | null>(null)
  const [overColumnId, setOverColumnId] = useState<Task['columnId'] | null>(null)
  const [draftTasksByColumnId, setDraftTasksByColumnId] = useState<TasksByColumnId | null>(null)
  const sensors = useSensors(
    useSensor(CustomPointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(CustomTouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
  )
  const columnIds = useMemo(() => columns.map((el) => el.id), [columns])

  const resetDragState = () => {
    activeTaskRef.current = null
    setActiveTask(null)
    setOverColumnId(null)
    setDraftTasksByColumnId(null)
  }

  const getTasksSnapshot = (): TasksByColumnId => makeTasksSnapshot(columnIds, getColumnTasks)

  const getVisibleColumnTasks = (columnId: Column['id']) =>
    draftTasksByColumnId?.[columnId] ?? getColumnTasks(columnId)

  const handleDragStart = ({ active }: DragStartEvent) => {
    if (disabled) {
      return
    }

    const activeData = active.data.current

    if (!isTaskDndTaskData(activeData)) {
      return
    }

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

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    const activeData = active.data.current

    if (disabled || !over) {
      resetDragState()
      return
    }

    if (isTaskDndSortableColumnData(activeData)) {
      const overData = over.data.current

      const overColumnId = isTaskDndSortableColumnData(overData)
        ? overData.column.id
        : isTaskDndColumnData(overData)
          ? overData.columnId
          : null

      if (!overColumnId) {
        resetDragState()
        return
      }

      const oldIndex = columns.findIndex((column) => column.id === activeData.column.id)
      const newIndex = columns.findIndex((column) => column.id === overColumnId)

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        try {
          await reorderColumns(arrayMove(columns, oldIndex, newIndex))

          notifications.show({
            title: `Перемещена колонка «${activeData.column.title}»`,
            message: 'Изменения сохранены',
            color: 'brand',
          })
        } catch {
          notifications.show({
            title: `Не удалось переместить колонку «${activeData.column.title}»`,
            message: 'Попробуйте перетащить колонку еще раз',
            color: 'red',
          })
        }
      }

      resetDragState()
      return
    }

    const draggedTask = activeTaskRef.current

    if (!draggedTask) {
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

  const collisionDetection: CollisionDetection = (args) => {
    const activeData = args.active.data.current

    if (isTaskDndSortableColumnData(activeData)) {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter((container) =>
          isTaskDndSortableColumnData(container.data.current),
        ),
      })
    }

    const pointerCollisions = pointerWithin(args)

    return pointerCollisions.length > 0 ? pointerCollisions : closestCorners(args)
  }

  return (
    <DndContext
      collisionDetection={collisionDetection}
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
