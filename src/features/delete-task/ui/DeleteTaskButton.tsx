import { useTagActions } from '@/entities/tag'
import { useTaskActions, type Task } from '@/entities/task'
import {
  deleteTaskCommentsByTaskId,
  getTaskCommentsByTaskId,
  restoreTaskComments,
  type TaskComment,
} from '@/entities/task-comment'
import { ActionIcon, Button, Group, Modal, Stack, Text, type ActionIconProps } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { Trash2 } from 'lucide-react'
import { useCallback } from 'react'
import { DeleteUndoNotificationContent } from './DeleteUndoNotificationContent'

interface DeleteTaskButtonProps {
  task: Task
  disabled?: boolean
  onDeleted?: () => void
  onRestored?: () => void
  size?: ActionIconProps['size']
  variant?: ActionIconProps['variant']
  iconSize?: number
}

export const DeleteTaskButton = ({
  task,
  disabled,
  onDeleted,
  onRestored,
  size = 'md',
  variant,
  iconSize = 16,
}: DeleteTaskButtonProps) => {
  const { deleteTask, restoreTasks } = useTaskActions()
  const { removeTagsIfUnused } = useTagActions()
  const [opened, { open, close }] = useDisclosure(false)

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
    close()
    onDeleted?.()

    let deletedComments: TaskComment[] = []

    try {
      deletedComments = await getTaskCommentsByTaskId(task.id)

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
    <>
      <ActionIcon
        onClick={open}
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

      <Modal centered onClose={close} opened={opened} title="Удалить задачу">
        <Stack gap="lg">
          <Text size="sm" c="gray.7">
            Вы уверены, что хотите удалить задачу «{task.title}»? Это действие нельзя отменить.
          </Text>

          <Group justify="flex-end">
            <Button color="gray" onClick={close} type="button" variant="subtle">
              Отмена
            </Button>

            <Button color="red" onClick={handleDeleteTask} type="button">
              Удалить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
