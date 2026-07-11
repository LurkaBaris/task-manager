import {
  createOrUpdateTaskComment,
  saveTaskComment,
  TASK_COMMENT_FORM_DEFAULT_VALUES,
  TaskCommentForm,
  type TaskComment,
  type TaskCommentFormValues,
} from '@/entities/task-comment'
import { notifications } from '@mantine/notifications'

interface CreateTaskCommentProps {
  taskId: TaskComment['taskId']
  onCreated: (comment: TaskComment) => void
}

export const CreateTaskComment = ({ taskId, onCreated }: CreateTaskCommentProps) => {
  const handleCreateComment = async (values: TaskCommentFormValues) => {
    const comment = createOrUpdateTaskComment({
      taskId,
      text: values.text,
      files: values.files,
    })

    try {
      await saveTaskComment(comment)
      onCreated(comment)
      notifications.show({
        title: 'Новый комментарий создан',
        message: 'Вы успешно создали комментарий',
        color: 'brand',
      })

      return true
    } catch {
      notifications.show({
        title: 'Комментарий не отправлен',
        message: 'Попробуйте еще раз',
        color: 'red',
      })

      return false
    }
  }

  return (
    <TaskCommentForm
      defaultValues={TASK_COMMENT_FORM_DEFAULT_VALUES}
      submitLabel="Отправить"
      resetAfterSubmit
      onSubmit={handleCreateComment}
    />
  )
}
