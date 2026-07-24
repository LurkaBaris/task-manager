import { useColumnActions, type Column } from '@/entities/column';
import { useTagActions } from '@/entities/tag';
import { selectTasks, useTaskActions, useTaskStore } from '@/entities/task';
import {
  deleteTaskCommentsByTaskId,
  getTaskCommentsByTaskIds,
  restoreTaskComments,
  type TaskComment,
} from '@/entities/task-comment';
import { ActionIcon, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { DeleteColumnUndoNotificationContent } from './DeleteColumnUndoNotificationContent';

interface DeleteColumnButtonProps {
  column: Column;
  onRemove: (columnId: Column['id']) => void;
  disabled?: boolean;
}

export const DeleteColumnButton = ({
  column,
  onRemove,
  disabled = false,
}: DeleteColumnButtonProps) => {
  const { deleteColumn, restoreColumn } = useColumnActions();
  const { clearColumnTasks, restoreTasks } = useTaskActions();
  const { removeTagsIfUnused } = useTagActions();
  const { tasksByColumnId } = useTaskStore(useShallow(selectTasks));
  const [opened, { open, close }] = useDisclosure(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const columnTasks = tasksByColumnId[column.id];

  const columnTaskTagIds = useMemo(() => {
    if (!columnTasks) return [];

    return Array.from(
      columnTasks.reduce((tagIds, task) => {
        if (task.tagId) {
          tagIds.add(task.tagId);
        }

        return tagIds;
      }, new Set<string>()),
    );
  }, [columnTasks]);

  const handleDeletedColumnNotificationClose = useCallback(async () => {
    if (!columnTaskTagIds.length) {
      return;
    }

    try {
      await removeTagsIfUnused(columnTaskTagIds);
    } catch {
      notifications.show({
        title: 'Не удалось очистить теги',
        message: 'Некоторые теги остались в списке, попробуйте обновить страницу',
        color: 'red',
      });
    }
  }, [columnTaskTagIds, removeTagsIfUnused]);

  const handleDelete = async () => {
    setIsDeleting(true);
    let deletedComments: TaskComment[] = [];

    try {
      deletedComments = await getTaskCommentsByTaskIds((columnTasks ?? []).map((task) => task.id));

      await Promise.all([
        deleteColumn(column.id),
        ...(columnTasks ?? []).map((task) => deleteTaskCommentsByTaskId(task.id)),
      ]);

      clearColumnTasks(column.id);
      onRemove(column.id);

      const notificationId = `delete-column-${column.id}`;

      notifications.show({
        id: notificationId,
        title: `Удалена колонка «${column.title}»`,
        message: (
          <DeleteColumnUndoNotificationContent
            column={column}
            notificationId={notificationId}
            tasks={columnTasks ?? []}
            comments={deletedComments}
          />
        ),
        color: 'brand',
        autoClose: 5000,
        onClose: handleDeletedColumnNotificationClose,
      });

      close();
    } catch {
      try {
        await restoreColumn(column);
        await Promise.all([restoreTasks(columnTasks ?? []), restoreTaskComments(deletedComments)]);
      } catch {
        notifications.show({
          title: 'Не удалось откатить удаление полностью',
          message: 'Обновите страницу и проверьте данные колонки',
          color: 'red',
        });
      }

      notifications.show({
        title: 'Не удалось удалить колонку',
        message: 'Попробуйте ещё раз',
        color: 'red',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ActionIcon
        aria-label="Удалить колонку"
        color="red"
        disabled={disabled || isDeleting}
        onClick={open}
        type="button"
        variant="subtle"
      >
        <Trash2 size={16} />
      </ActionIcon>

      <Modal centered opened={opened} onClose={close} title="Удалить колонку">
        <Stack>
          <Text size="sm">
            Колонка «{column.title}» будет удалена вместе со всеми задачами внутри неё.
          </Text>

          <Text c="dimmed" size="sm">
            Задач в колонке: {columnTasks?.length ?? 0}
          </Text>

          <Group justify="flex-end">
            <Button disabled={isDeleting} type="button" variant="default" onClick={close}>
              Отмена
            </Button>

            <Button color="red" loading={isDeleting} type="button" onClick={handleDelete}>
              Удалить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
