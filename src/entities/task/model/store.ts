import { create } from 'zustand'
import { useShallow } from 'zustand/shallow'
import { taskRepository } from '../api/taskRepository'
import type { Task } from './types'

type TaskPatch = Partial<Omit<Task, 'id' | 'createdAt'>>
type TasksByColumnId = Partial<Record<Task['columnId'], Task[]>>

interface ITaskState {
  tasksByColumnId: TasksByColumnId
  isLoading: boolean
  isLoaded: boolean
}

interface ITaskActions {
  loadTasksByColumnIds: (columnIds: Task['columnId'][]) => Promise<void>
  addTask: (task: Task) => Promise<void>
  updateTask: (taskId: Task['id'], patch: TaskPatch) => Promise<void>
  deleteTask: (taskId: Task['id']) => Promise<void>
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

const findTaskInColumns = (
  tasksByColumnId: TasksByColumnId,
  taskId: Task['id'],
): Task | undefined =>
  Object.values(tasksByColumnId)
    .flat()
    .find((task) => task.id === taskId)

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
        columnIds.map(async (columnId) => {
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

  addTask: async (task) => {
    await taskRepository.put(task)

    set((state) => ({
      tasksByColumnId: upsertTaskInColumns(state.tasksByColumnId, task),
    }))
  },

  updateTask: async (taskId, patch) => {
    const task = findTaskInColumns(get().tasksByColumnId, taskId)

    if (!task) {
      throw new Error('Task not found')
    }

    const updatedTask: Task = { ...task, ...patch }

    await taskRepository.put(updatedTask)

    set((state) => ({
      tasksByColumnId: upsertTaskInColumns(
        removeTaskFromColumns(state.tasksByColumnId, taskId),
        updatedTask,
      ),
    }))
  },

  deleteTask: async (taskId) => {
    await taskRepository.delete(taskId)

    set((state) => ({
      tasksByColumnId: removeTaskFromColumns(state.tasksByColumnId, taskId),
    }))
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
    })),
  )
