import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import { columnRepository } from '../api/columnRepository';
import type { ColumnSchemaType } from './columnSchema';
import { COLUMN_ORDER_STEP } from './constants';
import { createColumn } from './createColumn';
import type { Column } from './types';

interface ColumnState {
  columns: Column[];
  isLoaded: boolean;
}

interface ColumnActions {
  loadColumns: () => Promise<void>;
  createColumn: (patch: ColumnSchemaType) => Promise<void>;
  deleteColumn: (columnId: Column['id']) => Promise<void>;
  reorderColumns: (columns: Column[]) => Promise<void>;
  restoreColumn: (column: Column) => Promise<void>;
  setColumns: (columns: Column[]) => void;
}

export const normalizeColumnOrder = (columns: Column[]): Column[] =>
  columns.map((column, index) => ({
    ...column,
    order: (index + 1) * COLUMN_ORDER_STEP,
  }));

export const useColumnStore = create<ColumnState & ColumnActions>()((set, get) => ({
  columns: [],
  isLoaded: false,

  loadColumns: async () => {
    if (get().isLoaded) {
      return;
    }

    const columns = await columnRepository.getAll();

    set({
      columns,
      isLoaded: true,
    });
  },

  setColumns: (columns) => {
    set({
      columns,
      isLoaded: true,
    });
  },

  createColumn: async (patch) => {
    const columns = get().columns;

    const column = createColumn({
      ...patch,
      order: Math.max(0, ...columns.map((column) => column.order)) + COLUMN_ORDER_STEP,
    });

    await columnRepository.put(column);

    set({
      columns: [...columns, column],
    });
  },

  deleteColumn: async (columnId) => {
    await columnRepository.deleteWithTasks(columnId);

    set((state) => ({
      columns: state.columns.filter((column) => column.id !== columnId),
    }));
  },

  reorderColumns: async (columns) => {
    const previousColumns = get().columns;
    const normalizedColumns = normalizeColumnOrder(columns);

    set({
      columns: normalizedColumns,
    });

    try {
      await columnRepository.putMany(normalizedColumns);
    } catch (error) {
      set({
        columns: previousColumns,
      });

      throw error;
    }
  },

  restoreColumn: async (column) => {
    const columnsById = new Map(get().columns.map((column) => [column.id, column]));

    columnsById.set(column.id, column);

    const normalizedColumns = normalizeColumnOrder(
      [...columnsById.values()].sort((a, b) => a.order - b.order),
    );

    await columnRepository.putMany(normalizedColumns);

    set({
      columns: normalizedColumns,
    });
  },
}));

export const selectColumns = (state: ColumnState): ColumnState => ({
  columns: state.columns,
  isLoaded: state.isLoaded,
});

export const useColumnActions = () =>
  useColumnStore(
    useShallow((state) => ({
      loadColumns: state.loadColumns,
      createColumn: state.createColumn,
      deleteColumn: state.deleteColumn,
      reorderColumns: state.reorderColumns,
      restoreColumn: state.restoreColumn,
      setColumns: state.setColumns,
    })),
  );
