import { selectColumns, useColumnActions, useColumnStore } from '@/entities/column'
import { selectTasks, useTaskActions, useTaskStore } from '@/entities/task'
import { StatisticPieCard, StatisticStackedBarCard } from '@/shared/ui'
import {
  Alert,
  Box,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { getTasksFromColumns } from '../lib/getTasksFromColumns'
import { mapColumnsToStatisticPieItems } from '../lib/mapColumnsToStatisticPieItems'
import { mapPrioritiesToStatisticPieItems } from '../lib/mapPrioritiesToStatisticPieItems'
import { mapTaskTypesByColumnsToStackedBarData } from '../lib/mapTaskTypesByColumnsToStackedBarData'

export const TaskStatistics = () => {
  const theme = useMantineTheme()
  const [hasLoadError, setHasLoadError] = useState(false)
  const { columns, isLoaded: isColumnsLoaded } = useColumnStore(useShallow(selectColumns))
  const {
    tasksByColumnId,
    isLoading: isTasksLoading,
    isLoaded: isTasksLoaded,
  } = useTaskStore(useShallow(selectTasks))
  const { loadColumns } = useColumnActions()
  const { loadTasksByColumnIds } = useTaskActions()

  const sortedColumns = useMemo(() => {
    return [...columns].sort((firstColumn, secondColumn) => firstColumn.order - secondColumn.order)
  }, [columns])

  const columnIds = useMemo(() => {
    return sortedColumns.map((column) => column.id)
  }, [sortedColumns])

  const tasks = useMemo(() => {
    return getTasksFromColumns(tasksByColumnId)
  }, [tasksByColumnId])

  const columnStatisticItems = useMemo(() => {
    return mapColumnsToStatisticPieItems(sortedColumns, tasksByColumnId, theme)
  }, [sortedColumns, tasksByColumnId, theme])

  const priorityStatisticItems = useMemo(() => {
    return mapPrioritiesToStatisticPieItems(tasks, theme)
  }, [tasks, theme])

  const taskTypesByColumnsStatisticData = useMemo(() => {
    return mapTaskTypesByColumnsToStackedBarData(sortedColumns, tasksByColumnId, theme)
  }, [sortedColumns, tasksByColumnId, theme])

  const isInitialLoading =
    !hasLoadError &&
    (!isColumnsLoaded || (sortedColumns.length > 0 && isTasksLoading && !isTasksLoaded))

  useEffect(() => {
    const load = async () => {
      try {
        setHasLoadError(false)

        await loadColumns()
      } catch {
        setHasLoadError(true)

        notifications.show({
          title: 'Не удалось загрузить колонки',
          message: 'Попробуйте обновить страницу',
          color: 'red',
        })
      }
    }

    load()
  }, [loadColumns])

  useEffect(() => {
    if (!isColumnsLoaded || hasLoadError || columnIds.length === 0) {
      return
    }

    const load = async () => {
      try {
        setHasLoadError(false)

        await loadTasksByColumnIds(columnIds)
      } catch {
        setHasLoadError(true)

        notifications.show({
          title: 'Не удалось загрузить задачи',
          message: 'Попробуйте обновить страницу',
          color: 'red',
        })
      }
    }

    load()
  }, [columnIds, hasLoadError, isColumnsLoaded, loadTasksByColumnIds])

  if (hasLoadError) {
    return (
      <Alert color="red" title="Не удалось загрузить статистику">
        Попробуйте обновить страницу
      </Alert>
    )
  }

  return (
    <Stack gap="md">
      <Group align="center" justify="space-between">
        <Box miw={0}>
          <Title order={1}>Статистика</Title>

          <Text c="dimmed" mt={6}>
            Общая аналитика по задачам на доске
          </Text>
        </Box>
      </Group>

      {isInitialLoading ? (
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, lg: 2 }}>
            <Skeleton h={380} radius="md" />
            <Skeleton h={380} radius="md" />
          </SimpleGrid>

          <Skeleton h={380} radius="md" />
        </Stack>
      ) : sortedColumns.length === 0 ? (
        <Paper p="xl" withBorder>
          <Text fw={600}>Пока нет колонок</Text>

          <Text c="dimmed" mt={4} size="sm">
            Создайте первую колонку на главной странице, чтобы появилась статистика.
          </Text>
        </Paper>
      ) : (
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, lg: 2 }}>
            <StatisticPieCard
              description="Распределение всех задач между колонками доски"
              items={columnStatisticItems}
              title="Задачи по колонкам"
            />

            <StatisticPieCard
              description="Распределение всех задач по уровню приоритета"
              items={priorityStatisticItems}
              title="Задачи по приоритетам"
            />
          </SimpleGrid>

          <StatisticStackedBarCard
            data={taskTypesByColumnsStatisticData}
            description="Сколько задач каждого типа находится в каждой колонке"
            title="Типы задач по колонкам"
          />
        </Stack>
      )}
    </Stack>
  )
}
