import { selectColumns, useColumnStore } from '@/entities/column';
import { selectTasks, useTaskStore } from '@/entities/task';
import { StatisticDoughnutCard, StatisticPieCard, StatisticStackedBarCard } from '@/shared/ui';
import {
  Box,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { getTasksFromColumns } from '../lib/getTasksFromColumns';
import { mapColumnsToStatisticPieItems } from '../lib/mapColumnsToStatisticPieItems';
import { mapPrioritiesToStatisticPieItems } from '../lib/mapPrioritiesToStatisticPieItems';
import { mapTaskTypesByColumnsToStackedBarData } from '../lib/mapTaskTypesByColumnsToStackedBarData';

export const TaskStatistics = () => {
  const theme = useMantineTheme();
  const { columns, isLoaded: isColumnsLoaded } = useColumnStore(useShallow(selectColumns));
  const {
    tasksByColumnId,
    isLoading: isTasksLoading,
    isLoaded: isTasksLoaded,
  } = useTaskStore(useShallow(selectTasks));

  const sortedColumns = useMemo(() => {
    return [...columns].sort((firstColumn, secondColumn) => firstColumn.order - secondColumn.order);
  }, [columns]);

  const tasks = useMemo(() => {
    return getTasksFromColumns(tasksByColumnId);
  }, [tasksByColumnId]);

  const columnStatisticItems = useMemo(() => {
    return mapColumnsToStatisticPieItems(sortedColumns, tasksByColumnId, theme);
  }, [sortedColumns, tasksByColumnId, theme]);

  const priorityStatisticItems = useMemo(() => {
    return mapPrioritiesToStatisticPieItems(tasks, theme);
  }, [tasks, theme]);

  const taskTypesByColumnsStatisticData = useMemo(() => {
    return mapTaskTypesByColumnsToStackedBarData(sortedColumns, tasksByColumnId, theme);
  }, [sortedColumns, tasksByColumnId, theme]);

  const isInitialLoading =
    !isColumnsLoaded || (sortedColumns.length > 0 && isTasksLoading && !isTasksLoaded);

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

            <StatisticDoughnutCard
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
  );
};
