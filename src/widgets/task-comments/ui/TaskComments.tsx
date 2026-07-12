import {
  getTaskCommentsByTaskIds,
  sortTaskCommentsByCreatedAt,
  TaskCommentCard,
  type TaskComment,
} from '@/entities/task-comment'
import { CreateTaskComment } from '@/features/create-task-comment'
import { DeleteTaskCommentButton } from '@/features/delete-task-comment'
import { EditTaskCommentButton } from '@/features/edit-task-comment'
import { Badge, Group, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useEffect, useState } from 'react'
import styles from './TaskComments.module.css'

interface TaskCommentsProps {
  taskId: string
}

export const TaskComments = ({ taskId }: TaskCommentsProps) => {
  const [comments, setComments] = useState<TaskComment[]>([])

  useEffect(() => {
    let isActive = true

    const loadComments = async () => {
      try {
        const comments = await getTaskCommentsByTaskIds([taskId])

        if (isActive) {
          setComments(comments)
        }
      } catch {
        if (!isActive) return

        notifications.show({
          title: 'Не удалось загрузить комментарии',
          message: 'Попробуйте обновить страницу',
          color: 'red',
        })
      }
    }

    void loadComments()

    return () => {
      isActive = false
    }
  }, [taskId])

  const handleUpdatedComment = (updatedComment: TaskComment) => {
    setComments((comments) => {
      return comments.map((comment) => {
        return comment.id === updatedComment.id ? updatedComment : comment
      })
    })
  }

  const handleDeletedComment = (deletedCommentId: TaskComment['id']) => {
    setComments((comments) => {
      return comments.filter((comment) => comment.id !== deletedCommentId)
    })
  }

  const handleRestoredComment = (restoredComment: TaskComment) => {
    setComments((comments) => {
      const commentsWithoutRestored = comments.filter(
        (comment) => comment.id !== restoredComment.id,
      )

      return sortTaskCommentsByCreatedAt([...commentsWithoutRestored, restoredComment])
    })
  }

  return (
    <section className={styles.comments}>
      <Stack gap="lg">
        <Group gap="xs">
          <Text c="gray.9" component="h2" fw={700} m={0} size="md">
            Комментарии
          </Text>

          <Badge color="brand" size="sm" variant="light">
            {comments.length}
          </Badge>
        </Group>

        {comments.length > 0 && (
          <Stack gap="sm">
            {comments.map((comment) => (
              <TaskCommentCard
                key={comment.id}
                comment={comment}
                rightSectionActions={
                  <Group gap={2} wrap="nowrap">
                    <EditTaskCommentButton comment={comment} onUpdated={handleUpdatedComment} />

                    <DeleteTaskCommentButton
                      comment={comment}
                      onDeleted={handleDeletedComment}
                      onRestored={handleRestoredComment}
                    />
                  </Group>
                }
              />
            ))}
          </Stack>
        )}

        <CreateTaskComment
          taskId={taskId}
          onCreated={(comment) => setComments((comments) => [...comments, comment])}
        />
      </Stack>
    </section>
  )
}
