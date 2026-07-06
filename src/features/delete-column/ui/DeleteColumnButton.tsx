import { useColumnActions, type Column } from '@/entities/column'
import { selectTasks, useTaskActions, useTaskStore } from '@/entities/task'
import { ActionIcon, Button, Group, Modal, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { Trash2 } from 'lucide-react'
import { useShallow } from 'zustand/shallow'
import { DeleteColumnUndoNotificationContent } from './DeleteColumnUndoNotificationContent'

interface DeleteColumnButtonProps {
  column: Column
  onRemove: (columnId: Column['id']) => void
  disabled?: boolean
}

export const DeleteColumnButton = ({
  column,
  onRemove,
  disabled = false,
}: DeleteColumnButtonProps) => {
  const { deleteColumn } = useColumnActions()
  const { clearColumnTasks } = useTaskActions()
  const { tasksByColumnId } = useTaskStore(useShallow(selectTasks))
  const [opened, { open, close }] = useDisclosure(false)

  const columnTasks = tasksByColumnId[column.id] ?? []

  const handleDelete = async () => {
    try {
      await deleteColumn(column.id)
      clearColumnTasks(column.id)
      onRemove(column.id)

      const notificationId = `delete-column-${column.id}`

      notifications.show({
        id: notificationId,
        title: `Удалена колонка «${column.title}»`,
        message: (
          <DeleteColumnUndoNotificationContent
            column={column}
            notificationId={notificationId}
            tasks={columnTasks}
          />
        ),
        color: 'brand',
        autoClose: 5000,
      })

      close()
    } catch {
      notifications.show({
        title: 'Не удалось удалить колонку',
        message: 'Попробуйте ещё раз',
        color: 'red',
      })
    }
  }

  return (
    <>
      <ActionIcon
        aria-label="Удалить колонку"
        color="red"
        disabled={disabled}
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
            Задач в колонке: {columnTasks.length}
          </Text>

          <Group justify="flex-end">
            <Button type="button" variant="default" onClick={close}>
              Отмена
            </Button>

            <Button color="red" type="button" onClick={handleDelete}>
              Удалить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
