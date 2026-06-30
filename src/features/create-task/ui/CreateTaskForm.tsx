import { COLUMN_TITLE_BY_ID } from '@/entities/column'
import { TASK_PRIORITY_LABEL, taskActions, type Task } from '@/entities/task'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Group, Select, Stack, TextInput, Textarea } from '@mantine/core'
import { Controller, useForm } from 'react-hook-form'
import { createTaskSchema, type CreateTaskSchemaType } from '../model/createTaskSchema'
import styles from './CreateTaskForm.module.css'

interface CreateTaskFormProps {
  onCancel: () => void
  onCreate: (newTask: Task) => void
}

const statusOptions = Object.entries(COLUMN_TITLE_BY_ID).map(([value, label]) => ({
  value,
  label,
}))

const priorityOptions = Object.entries(TASK_PRIORITY_LABEL).map(([value, label]) => ({
  value,
  label,
}))

const inputClassNames = {
  error: styles.error,
  input: styles.input,
  label: styles.label,
}

const inputProps = {
  classNames: inputClassNames,
}

export const CreateTaskForm = ({ onCancel, onCreate }: CreateTaskFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid, isDirty },
  } = useForm<CreateTaskSchemaType>({
    defaultValues: {
      title: '',
      description: '',
      columnId: 'todo',
      priority: 'low',
    },
    mode: 'onBlur',
    resolver: zodResolver(createTaskSchema),
  })

  const onSubmit = (values: CreateTaskSchemaType) => {
    const newTask: Task = {
      id: `task-${window.crypto.randomUUID()}`,
      title: values.title,
      description: values.description,
      createdAt: new Date().toISOString(),
      columnId: values.columnId,
      priority: values.priority,
    }

    taskActions.addTask(newTask)
    onCreate(newTask)
    reset()
  }

  const handleCancel = () => {
    reset()
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
              data={priorityOptions}
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
            Создать
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
