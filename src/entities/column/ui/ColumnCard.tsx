import { Badge, Group, Paper, ScrollArea, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'
import type { Column } from '../model/types'
import styles from './ColumnCard.module.css'

interface ColumnCardProps {
  column: Column
  count: number
  children?: ReactNode
  emptyText?: string
}

export const ColumnCard = ({
  column,
  count,
  children,
  emptyText = 'Пока нет задач',
}: ColumnCardProps) => {
  return (
    <Paper className={styles.column} p="lg" radius="lg">
      <Group mb={22} justify="space-between" wrap="nowrap">
        <Title className={styles.title} order={2} size="md">
          {column.title}
        </Title>

        <Badge className={styles.counter} variant="light">
          {count}
        </Badge>
      </Group>

      <ScrollArea
        className={styles.body}
        overscrollBehavior="contain"
        scrollbarSize={6}
        scrollbars="y"
        type="hover"
        pb="sm"
      >
        <Stack className={count > 0 ? undefined : styles.bodyEmpty} gap="sm" pb="xl">
          {count > 0 ? (
            children
          ) : (
            <Text className={styles.emptyText} size="sm">
              {emptyText}
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Paper>
  )
}
