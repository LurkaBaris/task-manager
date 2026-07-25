import { ActionIcon } from '@mantine/core';
import { Pencil } from 'lucide-react';

interface EditTaskActionProps {
  disabled?: boolean;
  onClick?: () => void;
}

export const EditTaskAction = ({ disabled, onClick }: EditTaskActionProps) => {
  return (
    <ActionIcon
      onClick={disabled ? undefined : onClick}
      type="button"
      aria-label="Редактировать задачу"
      title="Редактировать"
      size="md"
      radius="md"
      data-no-dnd
      disabled={disabled}
    >
      <Pencil size={16} strokeWidth={2} data-no-dnd />
    </ActionIcon>
  );
};
