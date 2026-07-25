import { isTaskPriority, isTaskType } from '@/entities/task';
import type { TaskFilters } from '@/features/task-filters';
import { useDebouncedValue } from '@mantine/hooks';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TaskBoardQuery } from './types';

export const useTaskBoardQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const boardQuery = useMemo<TaskBoardQuery>(() => {
    return {
      query: searchParams.get('q') ?? '',
      priorities: searchParams.getAll('priority').filter(isTaskPriority),
      types: searchParams.getAll('type').filter(isTaskType),
      tagIds: searchParams.getAll('tag'),
    };
  }, [searchParams]);

  const [debouncedQuery] = useDebouncedValue(boardQuery.query, 300);

  const setQuery = useCallback(
    (query: string) => {
      setSearchParams(
        (currentParams) => {
          const nextParams = new URLSearchParams(currentParams);

          if (query.trim()) {
            nextParams.set('q', query);
          } else {
            nextParams.delete('q');
          }

          return nextParams;
        },
        {
          replace: true,
          preventScrollReset: true,
        },
      );
    },
    [setSearchParams],
  );

  const setFilters = useCallback(
    (filters: TaskFilters) => {
      setSearchParams(
        (currentParams) => {
          const nextParams = new URLSearchParams(currentParams);

          nextParams.delete('priority');
          nextParams.delete('type');
          nextParams.delete('tag');

          filters.priorities.forEach((priority) => {
            nextParams.append('priority', priority);
          });

          filters.types.forEach((type) => {
            nextParams.append('type', type);
          });

          filters.tagIds.forEach((tagId) => {
            nextParams.append('tag', tagId);
          });

          return nextParams;
        },
        {
          preventScrollReset: true,
        },
      );
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setFilters({
      priorities: [],
      types: [],
      tagIds: [],
    });
  }, [setFilters]);

  return {
    boardQuery,
    debouncedQuery,
    setQuery,
    setFilters,
    resetFilters,
  };
};
