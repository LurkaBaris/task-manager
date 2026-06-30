import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Task } from './types'

interface ITaskState {
  tasks: Task[]
}

interface ITaskActions {
  addTask: (task: Task) => void
  setTasks: (tasks: Task[]) => void
}

export type TaskStore = ITaskState & ITaskActions

export const TASKS_STORAGE_KEY = 'tasks'

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),
    }),
    {
      name: TASKS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export const selectTasks = (state: TaskStore): Task[] => state.tasks
export const taskActions: ITaskActions = {
  setTasks: useTaskStore.getState().setTasks,
  addTask: useTaskStore.getState().addTask,
}
