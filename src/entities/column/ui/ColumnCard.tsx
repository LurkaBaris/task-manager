import { Badge, Flex, Paper, ScrollArea, Stack, Text, Title } from '@mantine/core'
import clsx from 'clsx'
import { type ReactNode, type Ref } from 'react'
import type { Column } from '../model/types'
import styles from './ColumnCard.module.css'

interface ColumnCardProps {
  column: Column
  count: number
  listRef?: Ref<HTMLDivElement>
  children?: ReactNode
  headerControls?: ReactNode
  emptyText?: string
  isHightlighted?: boolean
  topRightAction?: ReactNode
}

export const ColumnCard = ({
  listRef,
  column,
  count,
  children,
  headerControls,
  emptyText = 'Пока нет задач',
  isHightlighted = false,
  topRightAction,
}: ColumnCardProps) => {
  return (
    <Paper
      radius="lg"
      mah="1000px"
      mih="420px"
      miw="360px"
      h="calc(100vh - 100px)"
      className={styles.wrapper}
    >
      <Flex direction="column" h="100%">
        <Stack pt="lg" px="md" gap="md" pb={10}>
          <Flex gap="md" align="center" justify="space-between">
            <Title className={styles.title} order={2} size="md">
              {column.title}
            </Title>

            <Flex gap="sm" align="center">
              <Badge className={styles.counter} variant="light">
                {count}
              </Badge>

              {topRightAction}
            </Flex>
          </Flex>

          <Flex gap="sm" align="center" justify="space-between">
            {headerControls}
          </Flex>
        </Stack>

        <ScrollArea
          className={styles.body}
          classNames={{
            content: styles.content,
            scrollbar: styles.scrollbar,
            viewport: styles.viewport,
          }}
          overscrollBehavior="contain"
          scrollbarSize={6}
          scrollbars="y"
          type="hover"
        >
          <Stack
            flex={1}
            className={clsx(
              styles.taskList,
              count === 0 && styles.bodyEmpty,
              isHightlighted && styles.taskListOver,
            )}
            gap="sm"
            px="md"
            pt="md"
            pb="lg"
            mih="100%"
            ref={listRef}
          >
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
