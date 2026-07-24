import type { Task } from '@/entities/task';

export type TaskDialogState =
  | {
      type: 'edit';
      task: Task;
    }
  | {
      type: 'delete';
      task: Task;
    }
  | null;
