import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Divider, FileButton, Group, Paper, Stack, Text, Textarea } from '@mantine/core'
import { Paperclip, Send } from 'lucide-react'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import {
  TASK_COMMENT_FILE_ACCEPT,
  taskCommentFormSchema,
  type TaskCommentFormValues,
} from '../model/createTaskCommentSchema'
import { TaskCommentAttachmentCard } from './TaskCommentAttachmentCard'
import styles from './TaskCommentForm.module.css'

interface TaskCommentFormProps {
  defaultValues: TaskCommentFormValues
  submitLabel: string
  disabled?: boolean
  resetAfterSubmit?: boolean
  onSubmit: (values: TaskCommentFormValues) => Promise<boolean>
}

export const TaskCommentForm = ({
  defaultValues,
  submitLabel,
  disabled = false,
  resetAfterSubmit = false,
  onSubmit,
}: TaskCommentFormProps) => {
  const {
    control,
    formState: { isSubmitting, isValid },
    handleSubmit,
    reset,
    setValue,
  } = useForm<TaskCommentFormValues>({
    defaultValues,
    mode: 'onChange',
    resolver: zodResolver(taskCommentFormSchema),
  })
  const resetFilePickerRef = useRef<() => void>(null)

  const text = useWatch({
    control,
    name: 'text',
  })

  const files = useWatch({
    control,
    name: 'files',
  })

  const hasText = text.trim().length > 0
  const hasFiles = files.length > 0
  const canSubmit = !disabled && !isSubmitting && isValid && (hasText || hasFiles)

  useEffect(() => {
    reset(defaultValues)
    resetFilePickerRef.current?.()
  }, [defaultValues, reset])

  useEffect(() => {
    if (files.length === 0) {
      resetFilePickerRef.current?.()
    }
  }, [files.length])

  const handleRemoveFile = (removedFileIndex: number) => {
    const nextFiles = files.slice(0, removedFileIndex).concat(files.slice(removedFileIndex + 1))

    setValue('files', nextFiles, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })

    if (nextFiles.length === 0) {
      resetFilePickerRef.current?.()
    }
  }

  const handleValidSubmit = async (values: TaskCommentFormValues) => {
    const isSubmitted = await onSubmit(values)

    if (isSubmitted && resetAfterSubmit) {
      reset(defaultValues)
    }
  }

  const submitForm = handleSubmit(handleValidSubmit)

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey)) {
      return
    }

    event.preventDefault()
    void submitForm()
  }

  return (
    <Paper
      bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))"
      className={styles.form}
      component="form"
      p={0}
      radius="md"
      shadow="none"
      withBorder={false}
      onSubmit={submitForm}
    >
      <Stack gap={0}>
        <Controller
          control={control}
          name="text"
          render={({ field, fieldState }) => (
            <Textarea
              aria-label="Текст комментария"
              autosize
              disabled={disabled || isSubmitting}
              error={fieldState.error?.message}
              maxRows={8}
              minRows={2}
              placeholder="Напишите комментарий..."
              classNames={{
                input: styles.textarea,
              }}
              value={field.value}
              variant="unstyled"
              onBlur={field.onBlur}
              onChange={field.onChange}
              onKeyDown={handleKeyDown}
            />
          )}
        />

        {hasFiles && (
          <Stack gap={6} px="md" pb="sm">
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              Прикрепленные файлы
            </Text>

            <Stack gap="xs">
              {files.map((file, index) => (
                <TaskCommentAttachmentCard
                  disabled={disabled || isSubmitting}
                  file={file}
                  key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                  name={file.name}
                  size={file.size}
                  type={file.type}
                  onRemove={() => handleRemoveFile(index)}
                />
              ))}
            </Stack>
          </Stack>
        )}

        <Divider color="light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))" />

        <Group
          align="center"
          className={styles.actions}
          gap="xs"
          justify="space-between"
          px="sm"
          py="xs"
          wrap="wrap"
        >
          <Controller
            control={control}
            name="files"
            render={({ field, fieldState }) => (
              <Stack gap={4}>
                <FileButton
                  accept={TASK_COMMENT_FILE_ACCEPT}
                  disabled={disabled || isSubmitting}
                  multiple
                  resetRef={resetFilePickerRef}
                  onChange={(selectedFiles) => {
                    field.onChange(field.value.concat(selectedFiles))
                    resetFilePickerRef.current?.()
                  }}
                >
                  {({ onClick }) => (
                    <Button
                      color="brand"
                      disabled={disabled || isSubmitting}
                      h={34}
                      leftSection={<Paperclip size={16} />}
                      size="sm"
                      type="button"
                      variant="light"
                      onBlur={field.onBlur}
                      onClick={onClick}
                    >
                      Прикрепить файлы
                    </Button>
                  )}
                </FileButton>

                {fieldState.error?.message && (
                  <Text c="red" size="xs">
                    {fieldState.error.message}
                  </Text>
                )}
              </Stack>
            )}
          />

          <Button
            color="brand"
            disabled={!canSubmit}
            h={34}
            leftSection={<Send size={16} />}
            loading={isSubmitting}
            miw={124}
            ml="auto"
            size="sm"
            type="submit"
            variant="filled"
          >
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}
