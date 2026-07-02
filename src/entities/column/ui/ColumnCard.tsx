import { Badge, Flex, Group, Paper, ScrollArea, Stack, Text, Title } from '@mantine/core'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import type { Column } from '../model/types'
import styles from './ColumnCard.module.css'

interface ColumnCardProps {
  column: Column
  count: number
  children?: ReactNode
  headerControls?: ReactNode
  emptyText?: string
}

export const ColumnCard = ({
  column,
  count,
  children,
  headerControls,
  emptyText = 'Пока нет задач',
}: ColumnCardProps) => {
  return (
    <Paper radius="lg" mah="1000px" mih="420px" miw="240px" h="calc(100vh - 100px)">
      <Flex direction="column" h="100%">
        <Group
          className={styles.header}
          pb={22}
          justify="space-between"
          wrap="nowrap"
          pt="lg"
          px="md"
        >
          <Title className={styles.title} order={2} size="md">
            {column.title}
          </Title>

          <Flex gap="sm" align="center">
            <Badge className={styles.counter} variant="light">
              {count}
            </Badge>

            {headerControls}
          </Flex>
        </Group>

        <ScrollArea
          className={styles.body}
          classNames={{ scrollbar: styles.scrollbar }}
          overscrollBehavior="contain"
          scrollbarSize={6}
          scrollbars="y"
          type="hover"
          pb="lg"
        >
          <Stack className={clsx(count === 0 && styles.bodyEmpty)} gap="sm" px="md">
            {count > 0 ? (
              children
            ) : (
              <Text className={styles.emptyText} size="sm">
                {emptyText}
              </Text>
            )}
          </Stack>
        </ScrollArea>
      </Flex>
    </Paper>
  )
}
