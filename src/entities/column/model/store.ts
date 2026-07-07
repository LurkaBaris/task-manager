import { groupTasksByColumnId, normalizeTasksByColumnId, useTaskStore } from '@/entities/task'
import type { ImportTasksMode, Task } from '@/entities/task/model/types'
import { create } from 'zustand'
import { useShallow } from 'zustand/shallow'
import { columnRepository } from '../api/columnRepository'
import type { ColumnSchemaType } from './columnSchema'
import { COLUMN_ORDER_STEP } from './constants'
import { createColumn } from './createColumn'
import type { Column } from './types'

interface ColumnState {
  columns: Column[]
  isLoaded: boolean
}

interface ColumnActions {
  loadColumns: () => Promise<void>
  createColumn: (patch: ColumnSchemaType) => Promise<void>
  deleteColumn: (columnId: Column['id']) => Promise<void>
  reorderColumns: (columns: Column[]) => Promise<void>
  importColumns: (columns: Column[], mode: ImportTasksMode) => Promise<void>
  importBoard: (params: {
    columns: Column[]
    tasks: Task[]
    mode: ImportTasksMode
  }) => Promise<void>
  restoreColumn: (column: Column) => Promise<void>
}

export const normalizeColumnOrder = (columns: Column[]): Column[] =>
  columns.map((column, index) => ({
    ...column,
    order: (index + 1) * COLUMN_ORDER_STEP,
  }))

export const useColumnStore = create<ColumnState & ColumnActions>()((set, get) => ({
  columns: [],
  isLoaded: false,

  loadColumns: async () => {
    if (get().isLoaded) {
      return
    }

    const columns = await columnRepository.getAll()

    set({
      columns,
      isLoaded: true,
    })
  },

  createColumn: async (patch) => {
    const columns = get().columns

    const column = createColumn({
      ...patch,
      order: Math.max(0, ...columns.map((column) => column.order)) + COLUMN_ORDER_STEP,
    })

    await columnRepository.put(column)

    set({
      columns: [...columns, column],
    })
  },

  deleteColumn: async (columnId) => {
    await columnRepository.deleteWithTasks(columnId)
    useTaskStore.getState().clearColumnTasks(columnId)

    set((state) => ({
      columns: state.columns.filter((column) => column.id !== columnId),
    }))
  },

  reorderColumns: async (columns) => {
    const previousColumns = get().columns
    const normalizedColumns = normalizeColumnOrder(columns)

    set({
      columns: normalizedColumns,
    })

    try {
      await columnRepository.putMany(normalizedColumns)
    } catch (error) {
      set({
        columns: previousColumns,
      })

      throw error
    }
  },

  importColumns: async (columns, mode) => {
    const normalizedColumns =
      mode === 'replace'
        ? normalizeColumnOrder(columns)
        : normalizeColumnOrder(
            [
              ...new Map(
                [...get().columns, ...columns].map((column) => [column.id, column]),
              ).values(),
            ].sort((a, b) => a.order - b.order),
          )

    await columnRepository.putMany(normalizedColumns)

    set({
      columns: normalizedColumns,
      isLoaded: true,
    })
  },

  importBoard: async ({ columns, tasks, mode }) => {
    const currentTasks = Object.values(useTaskStore.getState().tasksByColumnId).flatMap(
      (columnTasks) => columnTasks ?? [],
    )
    let columnsToImport = columns
    let tasksToImport = tasks

    if (mode === 'merge') {
      const columnsById = new Map(get().columns.map((column) => [column.id, column]))
      const importedTaskIds = new Set(tasks.map((task) => task.id))

      columns.forEach((column) => {
        columnsById.set(column.id, column)
      })

      columnsToImport = [...columnsById.values()].sort((a, b) => a.order - b.order)
      tasksToImport = [...currentTasks.filter((task) => !importedTaskIds.has(task.id)), ...tasks]
    }

    const normalizedColumns = normalizeColumnOrder(columnsToImport)
    const normalizedTasks = normalizeTasksByColumnId(tasksToImport)

    await columnRepository.replaceBoard({
      columns: normalizedColumns,
      tasks: normalizedTasks,
    })

    set({
      columns: normalizedColumns,
      isLoaded: true,
    })
    useTaskStore.setState({
      tasksByColumnId: groupTasksByColumnId(normalizedTasks),
      isLoaded: true,
    })
  },

  restoreColumn: async (column) => {
    const columnsById = new Map(get().columns.map((column) => [column.id, column]))

    columnsById.set(column.id, column)

    const normalizedColumns = normalizeColumnOrder(
      [...columnsById.values()].sort((a, b) => a.order - b.order),
    )

    await columnRepository.putMany(normalizedColumns)

    set({
      columns: normalizedColumns,
    })
  },
}))

export const selectColumns = (state: ColumnState): ColumnState => ({
  columns: state.columns,
  isLoaded: state.isLoaded,
})

export const useColumnActions = () =>
  useColumnStore(
    useShallow((state) => ({
      loadColumns: state.loadColumns,
      createColumn: state.createColumn,
      deleteColumn: state.deleteColumn,
      reorderColumns: state.reorderColumns,
      importColumns: state.importColumns,
      importBoard: state.importBoard,
      restoreColumn: state.restoreColumn,
    })),
  )
