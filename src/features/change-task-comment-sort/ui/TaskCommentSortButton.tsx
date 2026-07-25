import { Button } from '@mantine/core';
import { ArrowUpDown } from 'lucide-react';
import { TASK_COMMENT_SORT_ORDER, type TaskCommentSortOrder } from '../model/types';

interface TaskCommentSortButtonProps {
  sortOrder: TaskCommentSortOrder;
  onToggle: () => void;
}

export const TaskCommentSortButton = ({ sortOrder, onToggle }: TaskCommentSortButtonProps) => {
  const isAscending = sortOrder === TASK_COMMENT_SORT_ORDER.Asc;

  return (
    <Button
      leftSection={<ArrowUpDown size={13} />}
      px="xs"
      size="compact-xs"
      type="button"
      variant="subtle"
      onClick={onToggle}
    >
      {isAscending ? 'Старые' : 'Новые'}
    </Button>
  );
};
