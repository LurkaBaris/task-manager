import { useTagActions } from '@/entities/tag'
import { useTaskActions, type Task } from '@/entities/task'
import { ActionIcon, Button, Group, Modal, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { DeleteUndoNotificationContent } from './DeleteUndoNotificationContent'

interface DeleteTaskButtonProps {
  task: Task
  disabled?: boolean
}

export const DeleteTaskButton = ({ task, disabled }: DeleteTaskButtonProps) => {
  const { deleteTask } = useTaskActions()
  const { removeTagsIfUnused } = useTagActions()
  const [opened, { open, close }] = useDisclosure(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeletedTaskNotificationClose = useCallback(async () => {
    if (!task.tagId) {
      return
    }

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
    setIsDeleting(true)

    try {
      await deleteTask(task.id)

      const notificationId = `delete-task-${task.id}`

      notifications.show({
        id: notificationId,
        title: `Удалена задача «${task.title}»`,
        message: <DeleteUndoNotificationContent notificationId={notificationId} task={task} />,
        color: 'brand',
        autoClose: 5000,
        onClose: handleDeletedTaskNotificationClose,
      })

      close()
    } catch {
      notifications.show({
        title: `Не удалось удалить задачу «${task.title}»`,
        message: 'Попробуйте еще раз',
        color: 'red',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <ActionIcon
        onClick={open}
        type="button"
        aria-label="Удалить задачу"
        title="Удалить"
        size="md"
        radius="md"
        color="red"
        data-no-dnd
        disabled={disabled}
      >
        <Trash2 size={16} strokeWidth={2} data-no-dnd />
      </ActionIcon>

      <Modal centered onClose={close} opened={opened} title="Удалить задачу">
        <Stack gap="lg">
          <Text size="sm" c="gray.7">
            Вы уверены, что хотите удалить задачу «{task.title}»? Это действие нельзя отменить.
          </Text>

          <Group justify="flex-end">
            <Button
              color="gray"
              disabled={isDeleting}
              onClick={close}
              type="button"
              variant="subtle"
            >
              Отмена
            </Button>

            <Button color="red" loading={isDeleting} onClick={handleDeleteTask} type="button">
              Удалить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
