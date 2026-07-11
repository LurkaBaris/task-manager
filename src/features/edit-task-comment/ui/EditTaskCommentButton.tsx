import {
  createOrUpdateTaskComment,
  saveTaskComment,
  TaskCommentForm,
  type TaskComment,
  type TaskCommentFormValues,
} from '@/entities/task-comment'
import { ActionIcon, Modal, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { Pencil } from 'lucide-react'
import { useMemo } from 'react'

interface EditTaskCommentButtonProps {
  comment: TaskComment
  onUpdated: (comment: TaskComment) => unknown
}

export const EditTaskCommentButton = ({ comment, onUpdated }: EditTaskCommentButtonProps) => {
  const [opened, { open, close }] = useDisclosure(false)

  const defaultValues = useMemo<TaskCommentFormValues>(() => {
    return {
      text: comment.text,
      files: comment.attachments.map((attachment) => {
        return new File([attachment.file], attachment.name, {
          type: attachment.type,
        })
      }),
    }
  }, [comment])

  const handleUpdateComment = async (values: TaskCommentFormValues) => {
    const updatedComment = createOrUpdateTaskComment({
      comment,
      text: values.text,
      files: values.files,
    })

    try {
      await saveTaskComment(updatedComment)
      onUpdated(updatedComment)
      close()

      notifications.show({
        title: 'Комментарий обновлен',
        message: 'Изменения сохранены',
        color: 'brand',
      })

      return true
    } catch {
      notifications.show({
        title: 'Не удалось обновить комментарий',
        message: 'Попробуйте еще раз',
        color: 'red',
      })

      return false
    }
  }

  return (
    <>
      <Tooltip label="Изменить комментарий" withArrow>
        <ActionIcon
          aria-label="Изменить комментарий"
          color="brand"
          radius="md"
          size={28}
          type="button"
          variant="subtle"
          onClick={open}
        >
          <Pencil size={14} />
        </ActionIcon>
      </Tooltip>

      <Modal centered opened={opened} size="lg" title="Изменить комментарий" onClose={close}>
        <TaskCommentForm
          defaultValues={defaultValues}
          submitLabel="Сохранить"
          onSubmit={handleUpdateComment}
        />
      </Modal>
    </>
  )
}
