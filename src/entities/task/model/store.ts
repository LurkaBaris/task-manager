import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'
import type { Task } from './types'

interface ITaskState {
  tasks: Task[]
}

interface ITaskActions {
  addTask: (task: Task) => void
  updateTask: (taskId: Task['id'], patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  deleteTask: (taskId: Task['id']) => void
}

export type TaskStore = ITaskState & ITaskActions

export const TASKS_STORAGE_KEY = 'tasks'

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      updateTask: (taskId, patch) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, ...patch } : task)),
        })),

      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),
    }),
    {
      name: TASKS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export const selectTasks = (state: TaskStore): Task[] => state.tasks
export const useTaskActions = () =>
  useTaskStore(
    useShallow((state) => ({
      addTask: state.addTask,
      updateTask: state.updateTask,
      deleteTask: state.deleteTask,
    })),
  )
