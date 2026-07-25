import { deleteTaskComment, type TaskComment } from '@/entities/task-comment';
import { ActionIcon, Button, Group, Modal, Stack, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Trash2 } from 'lucide-react';
import { DeleteTaskCommentUndoNotificationContent } from './DeleteTaskCommentUndoNotificationContent';

interface DeleteTaskCommentButtonProps {
  comment: TaskComment;
  onDeleted: (commentId: TaskComment['id']) => unknown;
  onRestored: (comment: TaskComment) => unknown;
}

export const DeleteTaskCommentButton = ({
  comment,
  onDeleted,
  onRestored,
}: DeleteTaskCommentButtonProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  const handleDeleteComment = async () => {
    close();
    onDeleted(comment.id);

    try {
      await deleteTaskComment(comment.id);

      const notificationId = `delete-task-comment-${comment.id}`;

      notifications.show({
        id: notificationId,
        title: 'Комментарий удален',
        message: (
          <DeleteTaskCommentUndoNotificationContent
            comment={comment}
            notificationId={notificationId}
            onRestored={onRestored}
          />
        ),
        color: 'brand',
        autoClose: 5000,
      });
    } catch {
      onRestored(comment);

      notifications.show({
        title: 'Не удалось удалить комментарий',
        message: 'Попробуйте еще раз',
        color: 'red',
      });
    }
  };

  return (
    <>
      <Tooltip label="Удалить комментарий" withArrow>
        <ActionIcon
          aria-label="Удалить комментарий"
          color="red"
          radius="md"
          size={28}
          type="button"
          variant="subtle"
          onClick={open}
        >
          <Trash2 size={14} />
        </ActionIcon>
      </Tooltip>

      <Modal centered opened={opened} title="Удалить комментарий" onClose={close}>
        <Stack gap="lg">
          <Text c="light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-1))" size="sm">
            Комментарий будет удален. После удаления его можно будет восстановить.
          </Text>

          <Group justify="flex-end">
            <Button type="button" variant="default" onClick={close}>
              Отмена
            </Button>

            <Button color="red" type="button" onClick={handleDeleteComment}>
              Удалить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
