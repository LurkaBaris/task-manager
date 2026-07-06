import { useTaskActions, type Task } from '@/entities/task'
import { ActionIcon, Button, Group, Modal, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { DeleteUndoNotificationContent } from './DeleteUndoNotificationContent'

interface DeleteTaskButtonProps {
  task: Task
}

export const DeleteTaskButton = ({ task }: DeleteTaskButtonProps) => {
  const { deleteTask } = useTaskActions()
  const [opened, { open, close }] = useDisclosure(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteTask = async () => {
    setIsDeleting(true)

    try {
      await deleteTask(task.id)

      const notificationId = `delete-task-${task.id}`

      notifications.show({
        id: notificationId,
        title: 'Вы удалили задачу',
        message: <DeleteUndoNotificationContent notificationId={notificationId} task={task} />,
        color: 'brand',
        autoClose: 5000,
      })

      close()
    } catch {
      notifications.show({
        title: 'Не удалось удалить задачу',
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
      >
        <Trash2 size={16} strokeWidth={2} />
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
