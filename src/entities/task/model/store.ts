import { create } from 'zustand'
import { useShallow } from 'zustand/shallow'
import { taskRepository } from '../api/taskRepository'
import {
  getNextTaskPosition,
  getTaskPositionAfterNormalization,
  normalizeTaskPositions,
  normalizeTaskPositionsByOrder,
} from './position'
import type { Task, TasksByColumnId } from './types'

type TaskPatch = Partial<Omit<Task, 'id' | 'createdAt'>>
type MoveTaskParams = {
  task: Task
  targetColumnId: Task['columnId']
  previousTask?: Task
  nextTask?: Task
}
type ReorderColumnTasksParams = {
  columns: {
    columnId: Task['columnId']
    tasks: Task[]
  }[]
}

interface ITaskState {
  tasksByColumnId: TasksByColumnId
  isLoading: boolean
  isLoaded: boolean
}

interface ITaskActions {
  loadTasksByColumnIds: (columnIds: Task['columnId'][]) => Promise<void>
  addTask: (task: Task) => Promise<void>
  updateTask: (task: Task, patch: TaskPatch) => Promise<void>
  deleteTask: (taskId: Task['id']) => Promise<void>
  clearColumnTasks: (columnId: Task['columnId']) => void
  restoreTasks: (tasks: Task[]) => Promise<void>
  moveTask: (params: MoveTaskParams) => Promise<void>
  reorderColumnTasks: (params: ReorderColumnTasksParams) => Promise<void>
  getNextPositionByColumnId: (columnId: Task['columnId']) => number
  setTasks: (tasks: Task[]) => void
}

export type TaskStore = ITaskState & ITaskActions

const upsertTaskInColumns = (tasksByColumnId: TasksByColumnId, task: Task): TasksByColumnId => {
  const columnTasks = tasksByColumnId[task.columnId] ?? []

  return {
    ...tasksByColumnId,
    [task.columnId]: columnTasks.some((columnTask) => columnTask.id === task.id)
      ? columnTasks.map((columnTask) => (columnTask.id === task.id ? task : columnTask))
      : [...columnTasks, task],
  }
}

const removeTaskFromColumns = (
  tasksByColumnId: TasksByColumnId,
  taskId: Task['id'],
): TasksByColumnId =>
  Object.fromEntries(
    Object.entries(tasksByColumnId).map(([columnId, columnTasks]) => [
      columnId,
      columnTasks?.filter((task) => task.id !== taskId) ?? [],
    ]),
  )

export const groupTasksByColumnId = (tasks: Task[]): TasksByColumnId => {
  const tasksByColumnId: TasksByColumnId = {}

  tasks.forEach((task) => {
    const columnTasks = tasksByColumnId[task.columnId]

    if (columnTasks) {
      columnTasks.push(task)
    } else {
      tasksByColumnId[task.columnId] = [task]
    }
  })

  return tasksByColumnId
}

export const normalizeTasksByColumnId = (tasks: Task[]): Task[] =>
  Object.values(groupTasksByColumnId(tasks)).flatMap((columnTasks) =>
    normalizeTaskPositions(columnTasks ?? []),
  )

// решил попробовать использовать index по назначению, и чтобы в ui избежать reduce + filter
export const useTaskStore = create<TaskStore>()((set, get) => ({
  tasksByColumnId: {},
  isLoading: false,
  isLoaded: false,

  loadTasksByColumnIds: async (columnIds) => {
    if (get().isLoaded || get().isLoading) {
      return
    }

    set({ isLoading: true })

    try {
      const tasksByColumnEntries = await Promise.all(
        columnIds.map(async (columnId): Promise<[string, Task[]]> => {
          const columnTasks = await taskRepository.getByColumnId(columnId)

          return [columnId, columnTasks]
        }),
      )

      const tasksByColumnId: TasksByColumnId = Object.fromEntries(tasksByColumnEntries)

      set({
        tasksByColumnId,
        isLoaded: true,
      })
    } finally {
      set({ isLoading: false })
    }
  },

  setTasks: (tasks) => {
    set({
      tasksByColumnId: groupTasksByColumnId(tasks),
      isLoaded: true,
    })
  },

  addTask: async (task) => {
    await taskRepository.put(task)

    set((state) => ({
      tasksByColumnId: upsertTaskInColumns(state.tasksByColumnId, task),
    }))
  },

  updateTask: async (task, patch) => {
    const nextColumnId = patch.columnId ?? task.columnId

    if (nextColumnId !== task.columnId) {
      await get().moveTask({
        task: {
          ...task,
          ...patch,
          columnId: nextColumnId,
        },
        targetColumnId: nextColumnId,
      })

      return
    }

    const updatedTask: Task = {
      ...task,
      ...patch,
    }

    await taskRepository.put(updatedTask)

    set((state) => ({
      tasksByColumnId: upsertTaskInColumns(state.tasksByColumnId, updatedTask),
    }))
  },

  deleteTask: async (taskId) => {
    await taskRepository.delete(taskId)

    set((state) => ({
      tasksByColumnId: removeTaskFromColumns(state.tasksByColumnId, taskId),
    }))
  },

  getNextPositionByColumnId: (columnId) => {
    const columnTasks = get().tasksByColumnId[columnId] ?? []

    return getNextTaskPosition(columnTasks)
  },

  moveTask: async ({ task, targetColumnId, previousTask, nextTask }) => {
    if (previousTask && previousTask.columnId !== targetColumnId) {
      throw new Error('Предыдущая задача не из этой колонки')
    }

    if (nextTask && nextTask.columnId !== targetColumnId) {
      throw new Error('Следующая задача не из этой колонки')
    }

    const targetColumnTasksWithoutMovedTask = (get().tasksByColumnId[targetColumnId] ?? []).filter(
      (columnTask) => columnTask.id !== task.id,
    )

    const { position, normalizedTasks } = getTaskPositionAfterNormalization(
      targetColumnTasksWithoutMovedTask,
      previousTask,
      nextTask,
    )

    const movedTask: Task = {
      ...task,
      columnId: targetColumnId,
      position,
    }

    if (normalizedTasks) {
      await taskRepository.putMany([...normalizedTasks, movedTask])
    } else {
      await taskRepository.put(movedTask)
    }

    set((state) => {
      let nextTasksByColumnId = removeTaskFromColumns(state.tasksByColumnId, task.id)

      if (normalizedTasks) {
        nextTasksByColumnId = {
          ...nextTasksByColumnId,
          [targetColumnId]: normalizedTasks,
        }
      }

      return {
        tasksByColumnId: upsertTaskInColumns(nextTasksByColumnId, movedTask),
      }
    })
  },

  reorderColumnTasks: async ({ columns }) => {
    const normalizedColumnEntries = columns.map(({ columnId, tasks }) => ({
      columnId,
      tasks: normalizeTaskPositionsByOrder(
        tasks.map((task) => ({
          ...task,
          columnId,
        })),
      ),
    }))

    await taskRepository.putMany(normalizedColumnEntries.flatMap(({ tasks }) => tasks))

    set((state) => {
      const nextTasksByColumnId: TasksByColumnId = {
        ...state.tasksByColumnId,
      }

      normalizedColumnEntries.forEach(({ columnId, tasks }) => {
        nextTasksByColumnId[columnId] = tasks
      })

      return {
        tasksByColumnId: nextTasksByColumnId,
      }
    })
  },

  clearColumnTasks: (columnId) => {
    set((state) => {
      const nextTasksByColumnId = { ...state.tasksByColumnId }

      nextTasksByColumnId[columnId] = undefined

      return {
        tasksByColumnId: nextTasksByColumnId,
      }
    })
  },

  restoreTasks: async (tasks) => {
    await taskRepository.putMany(tasks)

    set((state) => {
      let nextTasksByColumnId = state.tasksByColumnId

      tasks.forEach((task) => {
        nextTasksByColumnId = upsertTaskInColumns(nextTasksByColumnId, task)
      })

      return {
        tasksByColumnId: nextTasksByColumnId,
      }
    })
  },
}))

export const selectTasks = (state: TaskStore): ITaskState => ({
  tasksByColumnId: state.tasksByColumnId,
  isLoading: state.isLoading,
  isLoaded: state.isLoaded,
})

export const useTaskActions = () =>
  useTaskStore(
    useShallow((state) => ({
      loadTasksByColumnIds: state.loadTasksByColumnIds,
      addTask: state.addTask,
      updateTask: state.updateTask,
      deleteTask: state.deleteTask,
      getNextPositionByColumnId: state.getNextPositionByColumnId,
      moveTask: state.moveTask,
      reorderColumnTasks: state.reorderColumnTasks,
      clearColumnTasks: state.clearColumnTasks,
      restoreTasks: state.restoreTasks,
      setTasks: state.setTasks,
    })),
  )
