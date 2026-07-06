import { Flex, Group, Paper, Skeleton, Stack } from '@mantine/core'
import styles from './TaskBoard.module.css'

const LOADING_COLUMNS_COUNT = 3
const LOADING_COLUMN_TASKS_COUNT = 3

interface TaskBoardSkeletonProps {
  columnsCount?: number
}

export const TaskBoardSkeleton = ({
  columnsCount = LOADING_COLUMNS_COUNT,
}: TaskBoardSkeletonProps) => {
  return (
    <Group
      align="stretch"
      aria-busy="true"
      aria-label="Загрузка доски"
      className={styles.board}
      gap="md"
      grow
      justify="space-between"
      wrap="nowrap"
    >
      {Array.from({ length: columnsCount }, (_, columnIndex) => (
        <Paper
          className={styles.loadingColumn}
          h="calc(100vh - 100px)"
          key={columnIndex}
          mah="1000px"
          mih="420px"
          miw="240px"
          radius="lg"
        >
          <Flex direction="column" h="100%">
            <Group justify="space-between" wrap="nowrap" pb={22} pt="lg" px="md">
              <Skeleton h={20} radius="xl" w="45%" />
              <Skeleton h={24} radius="xl" w={32} />
            </Group>

            <Stack gap="sm" px="md">
              {Array.from({ length: LOADING_COLUMN_TASKS_COUNT }, (_, taskIndex) => (
                <Stack className={styles.loadingTask} gap="xs" key={taskIndex}>
                  <Skeleton h={16} radius="xl" w="75%" />
                  <Skeleton h={12} radius="xl" w="100%" />
                  <Skeleton h={12} radius="xl" w="58%" />
                </Stack>
              ))}
            </Stack>
          </Flex>
        </Paper>
      ))}
    </Group>
  )
}
