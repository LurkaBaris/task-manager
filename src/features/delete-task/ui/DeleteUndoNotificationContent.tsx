import { selectColumns, useColumnStore } from '@/entities/column'
import { useTaskActions, type Task } from '@/entities/task'
import { restoreTaskComments, type TaskComment } from '@/entities/task-comment'
import { Button, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useShallow } from 'zustand/shallow'

interface DeleteUndoNotificationContentProps {
  task: Task
  comments: TaskComment[]
  notificationId: string
  onRestored?: () => unknown
}

export const DeleteUndoNotificationContent = ({
  task,
  comments,
  notificationId,
  onRestored,
}: DeleteUndoNotificationContentProps) => {
  const { columns } = useColumnStore(useShallow(selectColumns))
  const { restoreTasks } = useTaskActions()
  const hasTaskColumn = columns.some((column) => column.id === task.columnId)

  const handleClick = async () => {
    if (!hasTaskColumn) {
      notifications.show({
        title: `Не удалось восстановить задачу «${task.title}»`,
        message: 'Колонка этой задачи уже удалена',
        color: 'red',
      })
      return
    }

    try {
      await Promise.all([restoreTasks([task]), restoreTaskComments(comments)])
      onRestored?.()
      notifications.hide(notificationId)

      notifications.show({
        title: `Восстановлена задача «${task.title}»`,
        message: 'Задача снова на доске',
        color: 'brand',
      })
    } catch {
      notifications.show({
        title: `Не удалось восстановить задачу «${task.title}»`,
        message: 'Попробуйте импортировать задачу из резервной копии или создать ее заново',
        color: 'red',
      })
    }
  }

  return (
    <Stack justify="space-between" gap="xs">
      <Text size="sm">«{task.title}» удалена</Text>

      <Button onClick={handleClick} size="xs" type="button" variant="light">
        Отменить
      </Button>
    </Stack>
  )
}
