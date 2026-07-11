import { Avatar, Group, Paper, Stack, Text } from '@mantine/core'
import { UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { formatCommentDate } from '../lib/helpers'
import type { TaskComment } from '../model/types'
import { TaskCommentAttachmentCard } from './TaskCommentAttachmentCard'
import styles from './TaskCommentCard.module.css'

interface TaskCommentCardProps {
  comment: TaskComment
  authorName?: string
  authorInitial?: string
  rightSectionActions?: ReactNode
  footerSectionActions?: ReactNode
}

export const TaskCommentCard = ({
  comment,
  authorName = 'Вы',
  authorInitial,
  rightSectionActions,
  footerSectionActions,
}: TaskCommentCardProps) => {
  const hasText = comment.text.length > 0
  const hasAttachments = comment.attachments.length > 0

  return (
    <Group align="flex-start" gap="sm" miw={0} w="100%" wrap="nowrap">
      <Avatar
        aria-label={authorName}
        className={styles.avatar}
        color="brand"
        fw={700}
        radius="xl"
        size={36}
        variant="light"
        mt={8}
      >
        {authorInitial || <UserRound aria-hidden size={17} strokeWidth={2.1} />}
      </Avatar>

      <Paper bg="gray.0" flex={1} miw={0} p="md" radius="md" shadow="none" withBorder={false}>
        <Stack gap="xs">
          <Group align="center" justify="space-between" wrap="nowrap">
            <Group align="baseline" gap={6} wrap="wrap">
              <Text fw={700} size="sm">
                {authorName}
              </Text>

              <Text c="dimmed" size="xs">
                {formatCommentDate(comment.createdAt)}
              </Text>
            </Group>

            {rightSectionActions}
          </Group>

          {hasText && (
            <Text className={styles.commentText} c="gray.8" size="sm">
              {comment.text}
            </Text>
          )}

          {hasAttachments && (
            <Stack gap={5}>
              <Text c="dimmed" fw={600} size="xs">
                Вложения
              </Text>

              <Stack gap="xs">
                {comment.attachments.map((attachment) => (
                  <TaskCommentAttachmentCard
                    file={attachment.file}
                    key={attachment.id}
                    name={attachment.name}
                    size={attachment.size}
                    type={attachment.type}
                  />
                ))}
              </Stack>
            </Stack>
          )}

          {footerSectionActions}
        </Stack>
      </Paper>
    </Group>
  )
}
