import { Anchor } from '@mantine/core';

interface DeleteTaskFiltersButtonProps {
  disabled?: boolean;
  onReset: () => void;
}

export const DeleteTaskFiltersButton = ({
  disabled = false,
  onReset,
}: DeleteTaskFiltersButtonProps) => {
  return (
    <Anchor
      component="button"
      color="brand"
      disabled={disabled}
      size="xs"
      type="button"
      underline="hover"
      onClick={onReset}
    >
      Сбросить фильтры
    </Anchor>
  );
};
