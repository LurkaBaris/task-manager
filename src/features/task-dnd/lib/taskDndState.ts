import type { Task } from '@/entities/task'
import { arrayMove } from '@dnd-kit/sortable'
import { isTaskDndColumnData, isTaskDndTaskData } from '../model/guards'

export type TasksByColumnId = Partial<Record<Task['columnId'], Task[]>>

export const makeTasksSnapshot = (
  columnIds: Task['columnId'][],
  getColumnTasks: (columnId: Task['columnId']) => Task[],
): TasksByColumnId =>
  Object.fromEntries(columnIds.map((columnId) => [columnId, getColumnTasks(columnId)]))

// для поиска конкретной колонки после начала уже перетаскивания, это не то же самое что columnId
export const findTaskColumnId = (
  columnIds: Task['columnId'][],
  tasksByColumnId: TasksByColumnId,
  taskId: Task['id'],
): Task['columnId'] | undefined =>
  columnIds.find((columnId) => tasksByColumnId[columnId]?.some((task) => task.id === taskId))

export const getTaskDndTargetColumnId = (
  columnIds: Task['columnId'][],
  tasksByColumnId: TasksByColumnId,
  overData: unknown,
): Task['columnId'] | null => {
  if (isTaskDndColumnData(overData)) {
    return overData.columnId
  }

  if (isTaskDndTaskData(overData)) {
    return findTaskColumnId(columnIds, tasksByColumnId, overData.task.id) ?? null
  }

  return null
}

const insertTaskAt = (tasks: Task[], task: Task, index: number): Task[] => [
  ...tasks.slice(0, index),
  task,
  ...tasks.slice(index),
]

export const getTaskDndNextTasksByColumnId = ({
  tasksByColumnId,
  task,
  sourceColumnId,
  targetColumnId,
  overTask,
  insertAfter,
}: {
  tasksByColumnId: TasksByColumnId
  task: Task
  sourceColumnId: Task['columnId']
  targetColumnId: Task['columnId']
  overTask?: Task
  insertAfter: boolean
}): TasksByColumnId => {
  const sourceTasks = tasksByColumnId[sourceColumnId] ?? []
  const targetTasks = tasksByColumnId[targetColumnId] ?? []

  if (sourceColumnId === targetColumnId) {
    if (!overTask) {
      return tasksByColumnId
    }

    const oldIndex = sourceTasks.findIndex((sourceTask) => sourceTask.id === task.id)
    const newIndex = sourceTasks.findIndex((sourceTask) => sourceTask.id === overTask.id)

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return tasksByColumnId
    }

    return {
      ...tasksByColumnId,
      [sourceColumnId]: arrayMove(sourceTasks, oldIndex, newIndex),
    }
  }

  const nextSourceTasks = sourceTasks.filter((sourceTask) => sourceTask.id !== task.id)
  const nextTargetTasks = targetTasks.filter((targetTask) => targetTask.id !== task.id)
  const overTaskIndex = overTask
    ? nextTargetTasks.findIndex((targetTask) => targetTask.id === overTask.id)
    : -1
  const insertIndex =
    overTaskIndex === -1 ? nextTargetTasks.length : overTaskIndex + (insertAfter ? 1 : 0)

  return {
    ...tasksByColumnId,
    [sourceColumnId]: nextSourceTasks,
    [targetColumnId]: insertTaskAt(
      nextTargetTasks,
      { ...task, columnId: targetColumnId },
      insertIndex,
    ),
  }
}

export const getTaskDndTouchedColumns = ({
  tasksByColumnId,
  taskId,
  sourceColumnId,
  targetColumnId,
}: {
  tasksByColumnId: TasksByColumnId
  taskId: Task['id']
  sourceColumnId: Task['columnId']
  targetColumnId: Task['columnId']
}) => {
  const sourceTasks = tasksByColumnId[sourceColumnId] ?? []
  const targetTasks = tasksByColumnId[targetColumnId] ?? []

  if (sourceColumnId === targetColumnId) {
    return [{ columnId: targetColumnId, tasks: targetTasks }]
  }

  return [
    { columnId: sourceColumnId, tasks: sourceTasks.filter((task) => task.id !== taskId) },
    { columnId: targetColumnId, tasks: targetTasks },
  ]
}

const isSameTaskOrder = (tasks: Task[], nextTasks: Task[]): boolean =>
  tasks.length === nextTasks.length &&
  tasks.every((task, index) => task.id === nextTasks[index]?.id)

export const hasTaskDndOrderChanged = ({
  tasksByColumnId,
  nextTasksByColumnId,
  sourceColumnId,
  targetColumnId,
}: {
  tasksByColumnId: TasksByColumnId
  nextTasksByColumnId: TasksByColumnId
  sourceColumnId: Task['columnId']
  targetColumnId: Task['columnId']
}): boolean => {
  const sourceTasks = tasksByColumnId[sourceColumnId] ?? []
  const nextSourceTasks = nextTasksByColumnId[sourceColumnId] ?? []

  if (!isSameTaskOrder(sourceTasks, nextSourceTasks)) {
    return true
  }

  if (sourceColumnId === targetColumnId) {
    return false
  }

  const targetTasks = tasksByColumnId[targetColumnId] ?? []
  const nextTargetTasks = nextTasksByColumnId[targetColumnId] ?? []

  return !isSameTaskOrder(targetTasks, nextTargetTasks)
}
