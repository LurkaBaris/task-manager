import { type Column } from '@/entities/column'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Group, Select, Stack, TextInput, Textarea } from '@mantine/core'
import { Controller, useForm } from 'react-hook-form'
import { TASK_PRIORITY_OPTIONS } from '../model/options'
import { taskSchema, type TaskSchemaType } from '../model/taskSchema'
import styles from './TaskForm.module.css'

interface TaskFormProps {
  columns: Column[]
  defaultValues?: TaskSchemaType
  submitLabel?: string
  onCancel: () => void
  onSubmit: (values: TaskSchemaType) => void | Promise<void>
}

const inputProps = {
  classNames: {
    error: styles.error,
    input: styles.input,
    label: styles.label,
  },
}

export const TaskForm = ({
  columns,
  onCancel,
  onSubmit,
  defaultValues,
  submitLabel = 'Создать',
}: TaskFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid, isDirty },
  } = useForm<TaskSchemaType>({
    defaultValues: defaultValues || {
      title: '',
      description: '',
      columnId: columns[0]?.id ?? '',
      priority: 'low',
    },
    mode: 'onTouched',
    resolver: zodResolver(taskSchema),
  })

  const onSubmitModal = async (values: TaskSchemaType) => {
    await onSubmit(values)
  }

  const handleCancel = () => {
    onCancel()
  }

  const statusOptions = columns.map((column) => ({
    value: column.id,
    label: column.title,
  }))

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
