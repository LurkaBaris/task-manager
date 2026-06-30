import { Card, Group, Stack, Text, Title } from '@mantine/core'
import type { FC } from 'react'
import { taskDateFormatter } from '../lib/taskDateFormatter'
import type { Task } from '../model/types'
import styles from './TaskCard.module.css'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { TaskStatusBadge } from './TaskStatusBadge'

interface ITaskCard {
  task: Task
}

export const TaskCard: FC<ITaskCard> = ({ task }) => {
  const createdAt = taskDateFormatter.format(new Date(task.createdAt))

  return (
    <Card className={styles.card} component="article" padding="md" radius="md" withBorder>
      <Stack gap="xs">
        <Title className={styles.title} order={3}>
          {task.title}
        </Title>

        <Text className={styles.description} size="sm">
          {task.description}
        </Text>
      </Stack>

      <div className={styles.footer}>
        <Text className={styles.date} size="xs">
          Создано: {createdAt}
        </Text>

        <Group className={styles.badges} gap="xs">
          <TaskStatusBadge status={task.status} />
          <TaskPriorityBadge priority={task.priority} />
        </Group>
      </div>
    </Card>
  )
}
