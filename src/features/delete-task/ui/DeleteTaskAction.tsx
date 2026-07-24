import { ActionIcon, type ActionIconProps } from '@mantine/core';
import { Trash2 } from 'lucide-react';

interface DeleteTaskActionProps {
  disabled?: boolean;
  size?: ActionIconProps['size'];
  variant?: ActionIconProps['variant'];
  iconSize?: number;
  onClick?: () => void;
}

export const DeleteTaskAction = ({
  disabled,
  size = 'md',
  variant,
  iconSize = 16,
  onClick,
}: DeleteTaskActionProps) => {
  return (
    <ActionIcon
      onClick={disabled ? undefined : onClick}
      type="button"
      aria-label="Удалить задачу"
      title="Удалить"
      size={size}
      radius="md"
      color="red"
      variant={variant}
      data-no-dnd
      disabled={disabled}
    >
      <Trash2 size={iconSize} strokeWidth={2} data-no-dnd />
    </ActionIcon>
  );
};
