import { Card, Group, Stack, Text, Title } from '@mantine/core'
import { taskDateFormatter } from '../lib/taskDateFormatter'
import type { Task } from '../model/types'
import styles from './TaskCard.module.css'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { TaskStatusBadge } from './TaskStatusBadge'

interface TaskCardProps {
  task: Task
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const createdAt = taskDateFormatter.format(new Date(task.createdAt))

  return (
    <Card className={styles.card} component="article">
      <Stack gap="sm">
        <Stack gap="xs">
          <Title order={3} size="md" c="gray.9">
            {task.title}
          </Title>

          <Text size="sm" c="gray.7" lh={1.45}>
            {task.description}
          </Text>
        </Stack>

        <Stack gap={8} pt={10} className={styles.footer}>
          <Text size="xs" c="gray.6" fw={600}>
            Создано: {createdAt}
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
