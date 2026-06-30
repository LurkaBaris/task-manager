import { Badge, Group, Paper, Text, Title } from '@mantine/core'
import type { FC, ReactNode } from 'react'
import type { Column } from '../model/types'
import styles from './ColumnCard.module.css'

interface IColumnCard {
  column: Column
  count: number
  children?: ReactNode
  emptyText?: string
}

export const ColumnCard: FC<IColumnCard> = ({
  column,
  count,
  children,
  emptyText = 'Пока нет задач',
}) => {
  return (
    <Paper className={styles.column} p="md" radius="lg" withBorder>
      <Group className={styles.header} justify="space-between">
        <Title className={styles.title} order={2}>
          {column.title}
        </Title>

        <Badge className={styles.counter} variant="light">
          {count}
        </Badge>
      </Group>

      <div className={styles.body}>
        {count > 0 ? (
          children
        ) : (
          <Text className={styles.emptyText} size="sm">
            {emptyText}
          </Text>
        )}
      </div>
    </Paper>
  )
}
