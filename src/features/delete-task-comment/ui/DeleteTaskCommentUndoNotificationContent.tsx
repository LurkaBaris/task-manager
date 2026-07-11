import { restoreTaskComment, type TaskComment } from '@/entities/task-comment'
import { Button, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'

interface DeleteTaskCommentUndoNotificationContentProps {
  comment: TaskComment
  notificationId: string
  onRestored: (comment: TaskComment) => unknown
}

export const DeleteTaskCommentUndoNotificationContent = ({
  comment,
  notificationId,
  onRestored,
}: DeleteTaskCommentUndoNotificationContentProps) => {
  const handleRestoreComment = async () => {
    try {
      await restoreTaskComment(comment)
      onRestored(comment)
      notifications.hide(notificationId)

      notifications.show({
        title: 'Комментарий восстановлен',
        message: 'Комментарий снова отображается в задаче',
        color: 'brand',
      })
    } catch {
      notifications.show({
        title: 'Не удалось восстановить комментарий',
        message: 'Попробуйте еще раз',
        color: 'red',
      })
    }
  }

  return (
    <Stack gap="xs">
      <Text size="sm">Комментарий удален</Text>

      <Button size="xs" type="button" variant="light" onClick={handleRestoreComment}>
        Восстановить
      </Button>
    </Stack>
  )
}
