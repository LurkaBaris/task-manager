import type { TaskFilters } from '@/features/task-filters';

export interface TaskBoardQuery extends TaskFilters {
  query: string;
}
