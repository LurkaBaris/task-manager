import type { Task } from '@/entities/task';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';
import { SORTABLE_TASK_ID_PREFIX, type TaskDndTaskData } from '../model/types';
import styles from './SortableTask.module.css';

interface SortableTaskProps {
  task: Task;
  children: ReactNode;
  disabled?: boolean;
}

export const SortableTask = ({ task, disabled = false, children }: SortableTaskProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${SORTABLE_TASK_ID_PREFIX}${task.id}`,
    disabled,
    data: {
      type: 'task',
      task,
    } satisfies TaskDndTaskData,
  });

  return (
    <div
      ref={setNodeRef}
      className={styles.draggable}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};
