import { taskSchema, useTaskActions, type Task } from '@/entities/task'
import { useInlineEdit, type InlineEditSubmitResult } from '@/shared/lib'
import { ActionIcon, Box, Button, Group, Stack, Text, Textarea, Tooltip } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Check, Pencil } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import styles from './ChangeTaskDescriptionInline.module.css'

interface ChangeTaskDescriptionInlineProps {
  task: Task
}

export const ChangeTaskDescriptionInline = ({ task }: ChangeTaskDescriptionInlineProps) => {
  const { updateTask } = useTaskActions()

  const handleSubmit = async (value: string): Promise<InlineEditSubmitResult> => {
    const result = taskSchema.shape.description.safeParse(value)

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? 'Некорректное описание',
      }
    }

    const description = result.data

    if (description === task.description) {
      return { success: true }
    }

    try {
      await updateTask(task, { description })

      notifications.show({
        title: 'Описание обновлено',
        message: 'Изменения сохранены',
        color: 'brand',
      })

      return { success: true }
    } catch {
      notifications.show({
        title: `Не удалось обновить задачу «${task.title}»`,
        message: 'Попробуйте еще раз',
        color: 'red',
      })

      return { success: false }
    }
  }

  const { isEditing, value, error, isSaving, open, cancel, setValue, submit, handleBlur } =
    useInlineEdit({
      value: task.description,
      onSubmit: handleSubmit,
    })

  const handleKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      cancel()
      return
    }

    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      await submit()
    }
  }

  if (!isEditing) {
    return (
      <Box className={styles.descriptionView} component="span">
        <Text
          className={styles.descriptionText}
          component="span"
          c={task.description ? 'gray.8' : 'gray.6'}
          size="sm"
        >
          {task.description || 'Добавить описание'}
        </Text>

        <Tooltip label="Изменить описание" withArrow>
          <ActionIcon
            aria-label="Изменить описание"
            className={styles.descriptionEditButton}
            color="brand"
            radius="md"
            size={26}
            type="button"
            variant="subtle"
            onClick={open}
          >
            <Pencil size={14} />
          </ActionIcon>
        </Tooltip>
      </Box>
    )
  }

  return (
    <Stack gap="xs" onBlur={handleBlur}>
      <Textarea
        aria-label="Описание задачи"
        autosize
        autoFocus
        classNames={{
          input: styles.editorInput,
        }}
        error={error}
        maxRows={14}
        minRows={3}
        value={value}
        variant="unstyled"
        onChange={(event) => setValue(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
      />

      <Group gap="xs" justify="flex-end">
        <Button
          color="gray"
          disabled={isSaving}
          size="xs"
          type="button"
          variant="subtle"
          onClick={cancel}
        >
          Отмена
        </Button>

        <Button
          leftSection={<Check size={14} />}
          loading={isSaving}
          size="xs"
          type="button"
          onClick={submit}
        >
          Сохранить
        </Button>
      </Group>
    </Stack>
  )
}
