import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'
import type { TaskFilters } from './types'

const TASK_FILTERS_STORAGE_KEY = 'task-filters'

const EMPTY_TASK_FILTERS: TaskFilters = {
  priorities: [],
  types: [],
  tagIds: [],
}

interface ITaskFiltersActions {
  setFilters: (filters: TaskFilters) => void
  resetFilters: () => void
}

type TaskFiltersStore = TaskFilters & ITaskFiltersActions

export const useTaskFiltersStore = create<TaskFiltersStore>()(
  persist(
    (set) => ({
      ...EMPTY_TASK_FILTERS,

      setFilters: (filters) => {
        set({
          priorities: filters.priorities,
          types: filters.types,
          tagIds: filters.tagIds,
        })
      },

      resetFilters: () => {
        set(EMPTY_TASK_FILTERS)
      },
    }),
    {
      name: TASK_FILTERS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export const selectTaskFilters = (state: TaskFiltersStore): TaskFilters => ({
  priorities: state.priorities,
  types: state.types,
  tagIds: state.tagIds,
})

export const useTaskFilterActions = () =>
  useTaskFiltersStore(
    useShallow((state) => ({
      setFilters: state.setFilters,
      resetFilters: state.resetFilters,
    })),
  )
