import {
  Badge,
  Box,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { mapStatisticStackedBarDataToChartData } from '../lib/mapStatisticStackedBarDataToChartData';
import { getChartOptions } from '../model/chartOptions';
import type { StatisticStackedBarData } from '../model/types';
import styles from './StatisticStackedBarCard.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface StatisticStackedBarCardProps {
  title: string;
  description: string;
  data: StatisticStackedBarData;
  emptyMessage?: string;
}

export const StatisticStackedBarCard = ({
  title,
  description,
  data,
  emptyMessage = 'Пока нет задач для отображения статистики',
}: StatisticStackedBarCardProps) => {
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: false });
  const isDark = colorScheme === 'dark';
  const chartBorderColor = isDark ? theme.colors.dark[7] : theme.white;
  const chartTextColor = isDark ? theme.colors.dark[1] : theme.colors.gray[7];
  const chartGridColor = isDark ? theme.colors.dark[5] : theme.colors.gray[2];
  const total = data.datasets.reduce((sum, dataset) => {
    return sum + dataset.values.reduce((datasetSum, value) => datasetSum + value, 0);
  }, 0);

  const chartData = useMemo(() => {
    return mapStatisticStackedBarDataToChartData(data, chartBorderColor);
  }, [chartBorderColor, data]);

  const chartOptions = useMemo(() => {
    return getChartOptions(chartTextColor, chartGridColor);
  }, [chartGridColor, chartTextColor]);

  const datasetTotals = useMemo(() => {
    return data.datasets.map((dataset) => ({
      ...dataset,
      total: dataset.values.reduce((sum, value) => sum + value, 0),
    }));
  }, [data.datasets]);

  return (
    <Paper h="100%" p="lg" withBorder radius="lg">
      <Stack h="100%" gap="md">
        <Group align="flex-start" justify="space-between" wrap="nowrap">
          <Box miw={0}>
            <Title order={3} size="h4">
              {title}
            </Title>

            <Text c="dimmed" mt={4} size="sm">
              {description}
            </Text>
          </Box>

          <Badge color="brand" size="lg" tt="none" variant="light">
            Всего: {total}
          </Badge>
        </Group>

        <ScrollArea offsetScrollbars="x" scrollbarSize={6} type="hover">
          <Group gap="xs" miw="100%" pb={4} w="max-content" wrap="nowrap">
            {datasetTotals.map((dataset) => (
              <Box key={dataset.id} opacity={dataset.total === 0 ? 0.55 : 1} px="sm" py={7}>
                <Group gap="xs" wrap="nowrap">
                  <Box bg={dataset.color} className={styles.dot} h={10} w={10} />

                  <Text
                    c="light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-1))"
                    fw={600}
                    size="sm"
                  >
                    {dataset.label}:
                  </Text>

                  <Text
                    c="light-dark(var(--mantine-color-gray-9), var(--mantine-color-dark-0))"
                    fw={700}
                    ml="auto"
                    size="sm"
                  >
                    {dataset.total}
                  </Text>
                </Group>
              </Box>
            ))}
          </Group>
        </ScrollArea>

        {total > 0 ? (
          <Box h={300} mt="auto">
            <Bar data={chartData} options={chartOptions} />
          </Box>
        ) : (
          <Paper
            bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
            className={styles.emptyChart}
            h={300}
            mt="auto"
            radius="md"
            withBorder
          >
            <Text c="dimmed" size="sm">
              {emptyMessage}
            </Text>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
};
