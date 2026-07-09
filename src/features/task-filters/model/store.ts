import { create } from 'zustand'
import { useShallow } from 'zustand/shallow'
import type { TaskFilters } from './types'

interface ITaskFiltersActions {
  setFilters: (filters: TaskFilters) => void
  resetFilters: () => void
}

type TaskFiltersStore = TaskFilters & ITaskFiltersActions

export const useTaskFiltersStore = create<TaskFiltersStore>()((set) => ({
  priorities: [],
  types: [],
  tagIds: [],

  setFilters: (filters) => {
    set({
      priorities: filters.priorities,
      types: filters.types,
      tagIds: filters.tagIds,
    })
  },

  resetFilters: () => {
    set({
      priorities: [],
      types: [],
      tagIds: [],
    })
  },
}))

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
