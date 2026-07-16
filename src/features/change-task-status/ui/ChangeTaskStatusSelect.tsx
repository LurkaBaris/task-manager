import { selectColumns, useColumnStore } from '@/entities/column'
import { BadgeSelect, useTaskActions, type Task } from '@/entities/task'
import { notifications } from '@mantine/notifications'
import { useShallow } from 'zustand/shallow'

interface ChangeTaskStatusSelectProps {
  task: Task
  disabled?: boolean
}

export const ChangeTaskStatusSelect = ({ task, disabled = false }: ChangeTaskStatusSelectProps) => {
  const { columns } = useColumnStore(useShallow(selectColumns))
  const { updateTask } = useTaskActions()

  const handleSelect = async (columnId: string) => {
    const column = columns.find((column) => column.id === columnId)

    try {
      await updateTask(task, { columnId })

      notifications.show({
        title: `Статус изменен на «${column?.title ?? 'Без названия'}»`,
        message: 'Изменения сохранены',
        color: 'brand',
      })
    } catch {
      notifications.show({
        title: `Не удалось обновить задачу «${task.title}»`,
        message: 'Попробуйте еще раз',
        color: 'red',
      })
    }
  }

  return (
    <BadgeSelect
      value={task.columnId}
      disabled={disabled}
      options={columns.map((column) => ({
        value: column.id,
        label: column.title,
        color: column.color,
      }))}
      onChange={handleSelect}
    />
  )
}
