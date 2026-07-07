import { renderHighlightedText } from '@/shared/lib'
import { Card, Flex, Group, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import { taskDateFormatter } from '../lib/taskDateFormatter'
import type { Task } from '../model/types'
import styles from './TaskCard.module.css'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { TaskStatusBadge } from './TaskStatusBadge'

interface TaskCardProps {
  task: Task
  search?: string
  actions?: ReactNode
}

export const TaskCard = ({ task, actions, search }: TaskCardProps) => {
  const createdAt = taskDateFormatter.format(new Date(task.createdAt))

  return (
    <Card className={styles.card} component="article">
      <Stack gap="sm">
        <Stack gap="xs">
          <Flex gap="md" align="flex-start" justify="space-between" wrap="nowrap">
            <Title order={3} size="md" c="gray.9" className={styles.title}>
              <span data-no-dnd className={styles.selectableText}>
                {renderHighlightedText(task.title, search ?? '')}
              </span>
            </Title>

            {actions && (
              <Flex className={styles.actions} gap="sm" align="center">
                {actions}
              </Flex>
            )}
          </Flex>

          <Text size="sm" c="gray.7" lh={1.45} component="div" className={styles.description}>
            <span data-no-dnd className={styles.selectableText}>
              {renderHighlightedText(task.description, search ?? '')}
            </span>
          </Text>
        </Stack>

        <Stack gap={8} pt={10} className={styles.footer}>
          <Text size="xs" c="gray.6" fw={600}>
            <span data-no-dnd className={styles.selectableText}>
              Создано: {createdAt}
            </span>
          </Text>

          <Group gap="xs" wrap="wrap">
            <TaskStatusBadge columnId={task.columnId} />
            <TaskPriorityBadge priority={task.priority} />
          </Group>
        </Stack>
      </Stack>
    </Card>
  )
}
