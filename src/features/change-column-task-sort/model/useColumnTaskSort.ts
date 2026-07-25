import type { Column } from '@/entities/column';
import { useEffect, useState } from 'react';
import {
  TASK_SORT_ORDER,
  TASK_SORT_ORDER_STORAGE_KEY,
  parseSortOrderByColumnId,
  type TaskSortOrder,
  type TaskSortOrderByColumnId,
} from './sort';

export const useColumnTaskSort = () => {
  const [sortOrderByColumnId, setSortOrderByColumnId] = useState<TaskSortOrderByColumnId>(() => {
    const rawValue = localStorage.getItem(TASK_SORT_ORDER_STORAGE_KEY);

    if (!rawValue) {
      return {};
    }

    try {
      return parseSortOrderByColumnId(JSON.parse(rawValue));
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(TASK_SORT_ORDER_STORAGE_KEY, JSON.stringify(sortOrderByColumnId));
  }, [sortOrderByColumnId]);

  const changeColumnSortOrder = (columnId: Column['id'], sortOrder: TaskSortOrder) => {
    setSortOrderByColumnId((currentValue) => ({
      ...currentValue,
      [columnId]: sortOrder,
    }));
  };

  const getColumnSortOrder = (columnId: Column['id']): TaskSortOrder =>
    sortOrderByColumnId[columnId] ?? TASK_SORT_ORDER.Newest;

  const removeColumnSortOrder = (columnId: Column['id']) => {
    setSortOrderByColumnId((current) => {
      const next = { ...current };

      delete next[columnId];

      return next;
    });
  };

  return {
    sortOrderByColumnId,
    changeColumnSortOrder,
    getColumnSortOrder,
    removeColumnSortOrder,
  };
};
