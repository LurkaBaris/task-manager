import { useColumnActions, type Column } from '@/entities/column'
import { useTaskActions, type Task } from '@/entities/task'
import { Button, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'

interface DeleteColumnUndoNotificationContentProps {
  column: Column
  tasks: Task[]
  notificationId: string
}

export const DeleteColumnUndoNotificationContent = ({
  column,
  tasks,
  notificationId,
}: DeleteColumnUndoNotificationContentProps) => {
  const { restoreColumn } = useColumnActions()
  const { restoreTasks } = useTaskActions()

  const handleClick = async () => {
    try {
      await restoreColumn(column)
      await restoreTasks(tasks)

      notifications.hide(notificationId)

      notifications.show({
        title: `Восстановлена колонка «${column.title}»`,
        message:
          tasks.length > 0 ? `Восстановлено задач: ${tasks.length}` : 'Колонка снова на доске',
        color: 'brand',
      })
    } catch {
      notifications.show({
        title: `Не удалось восстановить колонку «${column.title}»`,
        message: 'Попробуйте импортировать данные из резервной копии',
        color: 'red',
      })
    }
  }

  return (
    <Stack gap="xs">
      <Text size="sm">
        Колонка «{column.title}» удалена вместе с задачами: {tasks.length}
      </Text>

      <Button onClick={handleClick} size="xs" type="button" variant="light">
        Отменить
      </Button>
    </Stack>
  )
}
