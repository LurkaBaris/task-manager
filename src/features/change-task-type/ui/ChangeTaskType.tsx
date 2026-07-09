import { TASK_TYPE_OPTIONS, useTaskActions, type Task } from '@/entities/task'
import { MetaSelect } from '@/shared/ui'
import { notifications } from '@mantine/notifications'
import { isTaskType } from '../model/guards'

interface ChangeTaskTypeProps {
  task: Task
  disabled?: boolean
}

export const ChangeTaskType = ({ task, disabled = false }: ChangeTaskTypeProps) => {
  const { updateTask } = useTaskActions()

  const selectedType = TASK_TYPE_OPTIONS.find((option) => option.value === task.type)
  const selectedTypeLabel = selectedType?.label ?? task.type

  const handleTypeChange = async (value: string | null) => {
    if (!value || value === task.type || !isTaskType(value)) {
      return
    }

    const type = TASK_TYPE_OPTIONS.find((option) => option.value === value)

    try {
      await updateTask(task, {
        type: value,
      })

      notifications.show({
        title: `Тип изменен на «${type?.label ?? 'Без названия'}»`,
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
    <MetaSelect
      data={TASK_TYPE_OPTIONS}
      value={task.type}
      displayValue={selectedTypeLabel}
      disabled={disabled}
      allowDeselect={false}
      onChange={handleTypeChange}
    />
  )
}
