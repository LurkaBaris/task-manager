import { useTagActions } from '@/entities/tag'
import { useTaskActions, type Task } from '@/entities/task'
import {
  deleteTaskCommentsByTaskId,
  getTaskCommentsByTaskIds,
  restoreTaskComments,
  type TaskComment,
} from '@/entities/task-comment'
import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useCallback } from 'react'
import { DeleteUndoNotificationContent } from './DeleteUndoNotificationContent'

interface DeleteTaskModalProps {
  task: Task
  opened: boolean
  onClose: () => void
  onDeleted?: () => void
  onRestored?: () => void
}

export const DeleteTaskModal = ({
  task,
  opened,
  onClose,
  onDeleted,
  onRestored,
}: DeleteTaskModalProps) => {
  const { deleteTask, restoreTasks } = useTaskActions()
  const { removeTagsIfUnused } = useTagActions()

  const handleTaskRestored = useCallback(() => {
    onRestored?.()
  }, [onRestored])

  const handleDeletedTaskNotificationClose = useCallback(async () => {
    if (!task.tagId) return

    try {
      await removeTagsIfUnused([task.tagId])
    } catch {
      notifications.show({
        title: 'Не удалось очистить тег',
        message: 'Тег остался в списке, попробуйте обновить страницу',
        color: 'red',
      })
    }
  }, [removeTagsIfUnused, task.tagId])

  const handleDeleteTask = async () => {
    onClose()
    onDeleted?.()

    let deletedComments: TaskComment[] = []

    try {
      deletedComments = await getTaskCommentsByTaskIds([task.id])

      await Promise.all([deleteTask(task.id), deleteTaskCommentsByTaskId(task.id)])

      const notificationId = `delete-task-${task.id}`

      notifications.show({
        id: notificationId,
        title: `Удалена задача «${task.title}»`,
        message: (
          <DeleteUndoNotificationContent
            notificationId={notificationId}
            task={task}
            comments={deletedComments}
            onRestored={handleTaskRestored}
          />
        ),
        color: 'brand',
        autoClose: 5000,
        onClose: handleDeletedTaskNotificationClose,
      })
    } catch {
      try {
        await Promise.all([restoreTasks([task]), restoreTaskComments(deletedComments)])
      } catch {
        notifications.show({
          title: 'Не удалось откатить удаление полностью',
          message: 'Обновите страницу и проверьте задачу',
          color: 'red',
        })
      }

      onRestored?.()

      notifications.show({
        title: `Не удалось удалить задачу «${task.title}»`,
        message: 'Попробуйте еще раз',
        color: 'red',
      })
    }
  }

  return (
    <Modal centered onClose={onClose} opened={opened} title="Удалить задачу">
      <Stack gap="lg">
        <Text c="light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-1))" size="sm">
          Вы уверены, что хотите удалить задачу «{task.title}»? Это действие нельзя отменить.
        </Text>

        <Group justify="flex-end">
          <Button color="gray" onClick={onClose} type="button" variant="subtle">
            Отмена
          </Button>

          <Button color="red" onClick={handleDeleteTask} type="button">
            Удалить
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
