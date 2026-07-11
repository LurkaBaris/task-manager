import { getTaskDetailsRoute } from '@/shared/config'
import { renderHighlightedText } from '@/shared/lib'
import { Card, Flex, Group, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { taskDateFormatter } from '../lib/taskDateFormatter'
import type { Task } from '../model/types'
import styles from './TaskCard.module.css'

interface TaskCardMetaItem {
  label: string
  content: ReactNode
}

interface TaskCardProps {
  task: Task
  search?: string
  headerActions?: ReactNode
  metaItems?: TaskCardMetaItem[]
  footerActions?: ReactNode
}

export const TaskCard = ({
  task,
  search,
  headerActions,
  metaItems,
  footerActions,
}: TaskCardProps) => {
  const createdAt = taskDateFormatter.format(new Date(task.createdAt))

  return (
    <Card className={styles.card} component="article">
      <Stack gap="sm">
        <Stack gap="xs">
          <Flex gap="md" align="flex-start" justify="space-between" wrap="nowrap">
            <NavLink to={getTaskDetailsRoute(task.id)} data-no-dnd className={styles.link}>
              <Title order={3} size="md" c="gray.9" className={styles.title}>
                <span data-no-dnd className={styles.selectableText}>
                  {renderHighlightedText(task.title, search ?? '')}
                </span>
              </Title>
            </NavLink>

            {headerActions && (
              <Flex className={styles.actions} gap="sm" align="center">
                {headerActions}
              </Flex>
            )}
          </Flex>

          <Text size="sm" c="gray.7" lh={1.45} component="div" className={styles.description}>
            <span data-no-dnd className={styles.selectableText}>
              {renderHighlightedText(task.description, search ?? '')}
            </span>
          </Text>

          {metaItems?.length && (
            <Stack gap={2} w="fit-content" maw="100%" data-no-dnd>
              {metaItems.map((item) => (
                <Group key={item.label} gap={10} w="fit-content" maw="100%" wrap="nowrap">
                  <Text size="13px" c="gray.6" fw={600} style={{ flexShrink: 0 }}>
                    {item.label}:
                  </Text>

                  <div style={{ minWidth: 0 }}>{item.content}</div>
                </Group>
              ))}
            </Stack>
          )}
        </Stack>

        <Stack gap={8} pt={10} className={styles.footer}>
          <Text size="xs" c="gray.6" fw={600}>
            <span data-no-dnd className={styles.selectableText}>
              Создано: {createdAt}
            </span>
          </Text>

          {footerActions && (
            <Group gap="xs" wrap="wrap">
              <Flex gap="sm" align="center" wrap="wrap">
                {footerActions}
              </Flex>
            </Group>
          )}
        </Stack>
      </Stack>
    </Card>
  )
}
