import { taskSchema, useTaskActions, type Task } from '@/entities/task';
import { useInlineEdit, type InlineEditSubmitResult } from '@/shared/lib';
import { ActionIcon, Text, Title, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Check, Pencil, X } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import styles from './ChangeTaskTitleInline.module.css';

interface ChangeTaskTitleInlineProps {
  task: Task;
}

export const ChangeTaskTitleInline = ({ task }: ChangeTaskTitleInlineProps) => {
  const { updateTask } = useTaskActions();

  const handleSubmit = async (value: string): Promise<InlineEditSubmitResult> => {
    const result = taskSchema.shape.title.safeParse(value);

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? 'Некорректное название',
      };
    }

    const title = result.data;

    if (title === task.title) {
      return { success: true };
    }

    try {
      await updateTask(task, { title });

      notifications.show({
        title: 'Название обновлено',
        message: 'Изменения сохранены',
        color: 'brand',
      });

      return { success: true };
    } catch {
      notifications.show({
        title: `Не удалось обновить задачу «${task.title}»`,
        message: 'Попробуйте еще раз',
        color: 'red',
      });

      return { success: false };
    }
  };

  const { isEditing, value, error, isSaving, open, cancel, setValue, submit, handleBlur } =
    useInlineEdit({
      value: task.title,
      onSubmit: handleSubmit,
    });

  const handleKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      await submit();
    }
  };

  if (!isEditing) {
    return (
      <Title
        c="light-dark(var(--mantine-color-gray-9), var(--mantine-color-dark-0))"
        className={styles.titleText}
        fw={750}
        order={1}
        size="30px"
      >
        <span>{task.title}</span>

        <Tooltip label="Изменить название" withArrow>
          <ActionIcon
            aria-label="Изменить название"
            className={styles.titleEditButton}
            color="brand"
            radius="md"
            size={28}
            type="button"
            variant="subtle"
            onClick={open}
          >
            <Pencil size={15} />
          </ActionIcon>
        </Tooltip>
      </Title>
    );
  }

  return (
    <div onBlur={handleBlur}>
      <div className={styles.titleEditor}>
        <span className={styles.titleInputSlot} data-value={value || ' '}>
          <textarea
            aria-label="Название задачи"
            autoFocus
            className={styles.titleInput}
            cols={1}
            rows={1}
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
        </span>

        <span className={styles.titleActions}>
          <Tooltip label="Сохранить">
            <ActionIcon
              aria-label="Сохранить название"
              loading={isSaving}
              radius="md"
              size={28}
              type="button"
              variant="light"
              onClick={submit}
            >
              <Check size={15} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Отменить">
            <ActionIcon
              aria-label="Отменить изменение названия"
              color="gray"
              disabled={isSaving}
              radius="md"
              size={28}
              type="button"
              variant="subtle"
              onClick={cancel}
            >
              <X size={15} />
            </ActionIcon>
          </Tooltip>
        </span>
      </div>

      {error && (
        <Text c="red" mt={4} size="xs">
          {error}
        </Text>
      )}
    </div>
  );
};
