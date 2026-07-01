import { COLUMN_TITLE_BY_ID } from '@/entities/column'
import { TASK_PRIORITY_OPTIONS } from '@/entities/task'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Group, Select, Stack, TextInput, Textarea } from '@mantine/core'
import { Controller, useForm } from 'react-hook-form'
import { taskSchema, type TaskSchemaType } from '../model/taskSchema'
import styles from './TaskForm.module.css'

interface TaskFormProps {
  defaultValues?: TaskSchemaType
  submitLabel?: string
  onCancel: () => void
  onSubmit: (values: TaskSchemaType) => void
}

const statusOptions = Object.entries(COLUMN_TITLE_BY_ID).map(([value, label]) => ({
  value,
  label,
}))

const inputProps = {
  classNames: {
    error: styles.error,
    input: styles.input,
    label: styles.label,
  },
}

export const TaskForm = ({
  onCancel,
  onSubmit,
  defaultValues,
  submitLabel = 'Создать',
}: TaskFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid, isDirty },
  } = useForm<TaskSchemaType>({
    defaultValues: defaultValues || {
      title: '',
      description: '',
      columnId: 'todo',
      priority: 'low',
    },
    mode: 'onBlur',
    resolver: zodResolver(taskSchema),
  })

  const onSubmitModal = (values: TaskSchemaType) => {
    onSubmit(values)
    reset()
  }

  const handleCancel = () => {
    reset()
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit(onSubmitModal)}>
      <Stack gap="md">
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              {...inputProps}
              {...field}
              error={fieldState.error?.message}
              label="Название"
              placeholder="Например, сверстать карточку"
              required
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <Textarea
              {...inputProps}
              {...field}
              error={fieldState.error?.message}
              label="Описание"
              minRows={3}
              placeholder="Кратко опиши задачу"
            />
          )}
        />

        <Controller
          name="columnId"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              {...inputProps}
              {...field}
              allowDeselect={false}
              data={statusOptions}
              error={fieldState.error?.message}
              label="Статус"
            />
          )}
        />

        <Controller
          name="priority"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              {...inputProps}
              {...field}
              allowDeselect={false}
              data={TASK_PRIORITY_OPTIONS}
              error={fieldState.error?.message}
              label="Приоритет"
            />
          )}
        />

        <Group justify="flex-end">
          <Button color="gray" onClick={handleCancel} type="button" variant="subtle">
            Отмена
          </Button>

          <Button disabled={!isValid || !isDirty} loading={isSubmitting} type="submit">
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
