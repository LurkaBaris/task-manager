import { TASK_TYPE_CONFIG, TASK_TYPE_OPTIONS, useTaskActions, type Task } from '@/entities/task'
import { MetaSelect } from '@/shared/ui'
import { Box, Group, Text, ThemeIcon } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Check } from 'lucide-react'
import { isTaskType } from '../model/guards'

interface ChangeTaskTypeProps {
  task: Task
  disabled?: boolean
}

export const ChangeTaskType = ({ task, disabled = false }: ChangeTaskTypeProps) => {
  const { updateTask } = useTaskActions()

  const selectedType = TASK_TYPE_OPTIONS.find((option) => option.value === task.type)
  const selectedTypeLabel = selectedType?.label ?? task.type
  const selectedTypeConfig = TASK_TYPE_CONFIG.find(({ id }) => id === task.type)
  const SelectedTypeIcon = selectedTypeConfig?.icon

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
      c={selectedTypeConfig?.color}
      disabled={disabled}
      allowDeselect={false}
      withCheckIcon={false}
      withScrollArea={false}
      icon={
        SelectedTypeIcon && selectedTypeConfig ? (
          <ThemeIcon color={selectedTypeConfig.color} size={18} variant="transparent">
            <SelectedTypeIcon size={15} strokeWidth={2} />
          </ThemeIcon>
        ) : undefined
      }
      renderOption={({ option, checked }) => {
        const typeConfig = TASK_TYPE_CONFIG.find(({ id }) => id === option.value)

        if (!typeConfig) {
          return option.label
        }

        const Icon = typeConfig.icon

        return (
          <Group flex={1} gap={0} wrap="nowrap" justify="space-between">
            <Group gap={12} wrap="nowrap">
              <ThemeIcon color={typeConfig.color} size={18} variant="transparent">
                <Icon size={17} strokeWidth={2} />
              </ThemeIcon>

              <Text size="sm" c={typeConfig.color}>
                {option.label}
              </Text>
            </Group>

            {checked && (
              <Box component="span" display="flex" mr={-4}>
                <Check size={15} strokeWidth={2.5} />
              </Box>
            )}
          </Group>
        )
      }}
      onChange={handleTypeChange}
    />
  )
}
