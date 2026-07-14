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
import { useEffect, useMemo, useRef, useState } from 'react'
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

interface DragOverFrameState {
  frameId: number | null
  event: DragOverEvent | null
  overColumnId: Task['columnId'] | null
  positionKey: string | null
}

const shouldInsertTaskAfter = (
  active: DragOverEvent['active'],
  over: NonNullable<DragOverEvent['over']>,
) => {
  const activeRect = active.rect.current.translated ?? active.rect.current.initial

  return Boolean(activeRect && activeRect.top > over.rect.top + over.rect.height / 2)
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
  const draftTasksByColumnIdRef = useRef<TasksByColumnId | null>(null)
  const dragOverFrameRef = useRef<DragOverFrameState>({
    frameId: null,
    event: null,
    overColumnId: null,
    positionKey: null,
  })
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

  const getTasksSnapshot = (): TasksByColumnId => makeTasksSnapshot(columnIds, getColumnTasks)

  const getVisibleColumnTasks = (columnId: Column['id']) =>
    draftTasksByColumnId?.[columnId] ?? getColumnTasks(columnId)

  const cancelPendingDragOver = () => {
    const dragOverFrame = dragOverFrameRef.current

    if (dragOverFrame.frameId !== null) {
      cancelAnimationFrame(dragOverFrame.frameId)
    }

    dragOverFrame.frameId = null
    dragOverFrame.event = null
    dragOverFrame.overColumnId = null
    dragOverFrame.positionKey = null
  }

  const resetDragState = () => {
    cancelPendingDragOver()
    activeTaskRef.current = null
    draftTasksByColumnIdRef.current = null
    setActiveTask(null)
    setOverColumnId(null)
    setDraftTasksByColumnId(null)
  }

  const setNextOverColumnId = (nextOverColumnId: Task['columnId'] | null) => {
    const dragOverFrame = dragOverFrameRef.current

    if (dragOverFrame.overColumnId === nextOverColumnId) {
      return
    }

    dragOverFrame.overColumnId = nextOverColumnId
    setOverColumnId(nextOverColumnId)
  }

  const shouldProcessDragOverPosition = (positionKey: string): boolean => {
    const dragOverFrame = dragOverFrameRef.current

    if (dragOverFrame.positionKey === positionKey) {
      return false
    }

    dragOverFrame.positionKey = positionKey
    return true
  }

  const getDragOverPositionKey = ({
    currentColumnId,
    targetColumnId,
    overTask,
    insertAfter,
  }: {
    currentColumnId: Task['columnId'] | undefined
    targetColumnId: Task['columnId']
    overTask: Task | undefined
    insertAfter: boolean
  }): string =>
    [currentColumnId ?? 'none', targetColumnId, overTask?.id ?? 'column', insertAfter].join(':')

  useEffect(() => {
    return () => {
      cancelPendingDragOver()
    }
  }, [])

  const handleDragStart = ({ active }: DragStartEvent) => {
    if (disabled) {
      return
    }

    const activeData = active.data.current

    if (!isTaskDndTaskData(activeData)) {
      return
    }

    const tasksSnapshot = getTasksSnapshot()

    cancelPendingDragOver()
    dragOverFrameRef.current.overColumnId = null
    activeTaskRef.current = activeData.task
    draftTasksByColumnIdRef.current = tasksSnapshot
    setActiveTask(activeData.task)
  }

  const handleDragCancel = () => {
    resetDragState()
  }

  const processDragOver = ({ active, over }: DragOverEvent) => {
    const draggedTask = activeTaskRef.current

    if (disabled || !over || !draggedTask) {
      setNextOverColumnId(null)
      dragOverFrameRef.current.positionKey = null
      return
    }

    const tasksByColumnId = draftTasksByColumnIdRef.current ?? getTasksSnapshot()
    const overData = over.data.current
    const targetColumnId = getTaskDndTargetColumnId(columnIds, tasksByColumnId, overData)

    if (!targetColumnId) {
      return
    }

    setNextOverColumnId(targetColumnId)

    const currentColumnId = findTaskColumnId(columnIds, tasksByColumnId, draggedTask.id)
    const overTask = isTaskDndTaskData(overData) ? overData.task : undefined
    const insertAfter = overTask ? shouldInsertTaskAfter(active, over) : false
    const positionKey = getDragOverPositionKey({
      currentColumnId,
      targetColumnId,
      overTask,
      insertAfter,
    })

    if (!shouldProcessDragOverPosition(positionKey) || !currentColumnId) {
      return
    }

    if (
      currentColumnId === targetColumnId &&
      targetColumnId === draggedTask.columnId &&
      draftTasksByColumnIdRef.current === null
    ) {
      return
    }

    const nextTasksByColumnId = getTaskDndNextTasksByColumnId({
      tasksByColumnId,
      task: draggedTask,
      sourceColumnId: currentColumnId,
      targetColumnId,
      overTask,
      insertAfter,
    })

    if (
      hasTaskDndOrderChanged({
        tasksByColumnId,
        nextTasksByColumnId,
        sourceColumnId: currentColumnId,
        targetColumnId,
      })
    ) {
      draftTasksByColumnIdRef.current = nextTasksByColumnId
      setDraftTasksByColumnId(nextTasksByColumnId)
    }
  }

  const flushPendingDragOver = () => {
    const dragOverFrame = dragOverFrameRef.current

    if (dragOverFrame.frameId !== null) {
      cancelAnimationFrame(dragOverFrame.frameId)
      dragOverFrame.frameId = null
    }

    const pendingEvent = dragOverFrame.event
    dragOverFrame.event = null

    if (pendingEvent) {
      processDragOver(pendingEvent)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const dragOverFrame = dragOverFrameRef.current
    dragOverFrame.event = event

    if (dragOverFrame.frameId !== null) {
      return
    }

    dragOverFrame.frameId = requestAnimationFrame(() => {
      dragOverFrame.frameId = null

      const pendingEvent = dragOverFrame.event
      dragOverFrame.event = null

      if (pendingEvent) {
        processDragOver(pendingEvent)
      }
    })
  }

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    flushPendingDragOver()

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
    const previewTasksByColumnId = draftTasksByColumnIdRef.current ?? tasksSnapshot

    const targetColumnId =
      findTaskColumnId(columnIds, previewTasksByColumnId, draggedTask.id) ??
      getTaskDndTargetColumnId(columnIds, previewTasksByColumnId, overData)

    if (!targetColumnId) {
      resetDragState()
      return
    }

    const isOverDraggedTask = isTaskDndTaskData(overData) && overData.task.id === draggedTask.id
    const nextTasksByColumnId = isOverDraggedTask
      ? previewTasksByColumnId
      : getTaskDndNextTasksByColumnId({
          tasksByColumnId: tasksSnapshot,
          task: draggedTask,
          sourceColumnId,
          targetColumnId,
          overTask: isTaskDndTaskData(overData) ? overData.task : undefined,
          insertAfter: shouldInsertTaskAfter(active, over),
        })

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
