import {
  COLUMN_COLOR_OPTIONS,
  DEFAULT_COLUMN_COLOR,
  columnSchema,
  useColumnActions,
  type ColumnSchemaType,
} from '@/entities/column';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Plus } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

interface CreateColumnButtonProps {
  disabled?: boolean;
  variant?: 'light' | 'filled';
}

export const CreateColumnButton = ({
  disabled = false,
  variant = 'light',
}: CreateColumnButtonProps) => {
  const { createColumn } = useColumnActions();
  const [opened, { open, close }] = useDisclosure(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ColumnSchemaType>({
    resolver: zodResolver(columnSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      color: DEFAULT_COLUMN_COLOR,
    },
  });

  const handleClose = () => {
    reset();
    close();
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createColumn(values);

      notifications.show({
        title: `Создана колонка «${values.title}»`,
        message: 'Колонка добавлена в конец доски',
        color: 'brand',
      });

      handleClose();
    } catch {
      notifications.show({
        title: 'Не удалось создать колонку',
        message: 'Попробуйте ещё раз',
        color: 'red',
      });
    }
  });

  return (
    <>
      <Button
        disabled={disabled}
        leftSection={<Plus size={16} />}
        onClick={open}
        type="button"
        variant={variant}
      >
        Создать колонку
      </Button>

      <Modal centered opened={opened} onClose={handleClose} title="Создать колонку">
        <form onSubmit={onSubmit}>
          <Stack>
            <TextInput
              label="Название"
              placeholder="Например, На проверке"
              error={errors.title?.message}
              {...register('title')}
            />

            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <Select
                  {...field}
                  allowDeselect={false}
                  label="Цвет"
                  data={COLUMN_COLOR_OPTIONS}
                  error={errors.color?.message}
                />
              )}
            />

            <Group justify="flex-end">
              <Button type="button" variant="default" onClick={handleClose}>
                Отмена
              </Button>

              <Button disabled={!isValid} loading={isSubmitting} type="submit">
                Создать
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
};
