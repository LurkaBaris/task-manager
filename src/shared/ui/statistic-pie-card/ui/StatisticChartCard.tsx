import { Badge, Box, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import type { ReactNode } from 'react'
import type { StatisticPieItem } from '../model/types'
import styles from './StatisticCard.module.css'
import { StatisticPieLegend } from './StatisticPieLegend'

ChartJS.register(ArcElement, Tooltip, Legend)

interface StatisticChartCardProps {
  title: string
  description: string
  total: number
  visibleItems: StatisticPieItem[]
  visibleTotal: number
  children: ReactNode
  onLegendItemMouseEnter: (item: StatisticPieItem) => void
  onLegendItemMouseLeave: () => void
}

export const StatisticChartCard = ({
  title,
  description,
  total,
  visibleItems,
  visibleTotal,
  children,
  onLegendItemMouseEnter,
  onLegendItemMouseLeave,
}: StatisticChartCardProps) => {
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

        {total > 0 ? (
          <Grid align="center" gap={{ base: 'md', sm: 'lg' }} mt="xs">
            <Grid.Col span={{ base: 12, sm: 5 }}>
              <Box className={styles.chartBox} mx="auto" pos="relative">
                {children}
              </Box>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 7 }}>
              <StatisticPieLegend
                items={visibleItems}
                total={visibleTotal}
                onItemMouseEnter={onLegendItemMouseEnter}
                onItemMouseLeave={onLegendItemMouseLeave}
              />
            </Grid.Col>
          </Grid>
        ) : (
          <Paper
            bg="gray.0"
            h={230}
            radius="md"
            withBorder
            style={{
              alignItems: 'center',
              borderStyle: 'dashed',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Text c="dimmed" size="sm">
              Пока нет задач для отображения статистики
            </Text>
          </Paper>
        )}
      </Stack>
    </Paper>
  )
}
