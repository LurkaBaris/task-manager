import { Badge, Box, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { useMemo, useRef } from 'react'
import { Pie } from 'react-chartjs-2'
import { mapStatisticItemsToPieChartData } from '../lib/mapStatisticItemsToPieChartData'
import { chartOptions } from '../model/chartOptions'
import type { StatisticPieItem } from '../model/types'
import { StatisticPieCounters } from './StatisticPieCounters'

ChartJS.register(ArcElement, Tooltip, Legend)

interface StatisticPieCardProps {
  title: string
  description: string
  items: StatisticPieItem[]
}

export const StatisticPieCard = ({ title, description, items }: StatisticPieCardProps) => {
  const chartRef = useRef<ChartJS<'pie', number[], string> | null>(null)
  const total = items.reduce((sum, item) => sum + item.count, 0)
  const chartData = useMemo(() => {
    return mapStatisticItemsToPieChartData(items)
  }, [items])

  const visibleItems = useMemo(() => {
    return items.filter((item) => item.count > 0)
  }, [items])

  const getChartCenterPosition = (chart: NonNullable<typeof chartRef.current>) => ({
    x: chart.chartArea.left + chart.chartArea.width / 2,
    y: chart.chartArea.top + chart.chartArea.height / 2,
  })

  const setActiveChartItem = (itemIndex: number | null) => {
    const chart = chartRef.current

    if (!chart) {
      return
    }

    const activeElements =
      itemIndex === null
        ? []
        : [
            {
              datasetIndex: 0,
              index: itemIndex,
            },
          ]

    chart.setActiveElements(activeElements)

    chart.tooltip?.setActiveElements(
      activeElements,
      itemIndex === null ? { x: 0, y: 0 } : getChartCenterPosition(chart),
    )

    chart.update()
  }

  const handleCounterMouseEnter = (item: StatisticPieItem) => {
    const itemIndex = visibleItems.findIndex((visibleItem) => visibleItem.id === item.id)

    if (itemIndex === -1) {
      return
    }

    setActiveChartItem(itemIndex)
  }

  const handleCounterMouseLeave = () => {
    setActiveChartItem(null)
  }

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

        <StatisticPieCounters
          items={items}
          onItemMouseEnter={handleCounterMouseEnter}
          onItemMouseLeave={handleCounterMouseLeave}
        />

        {total > 0 ? (
          <Box h={250} mt="auto" mx="auto" w="min(100%, 360px)">
            <Pie ref={chartRef} data={chartData} options={chartOptions} />
          </Box>
        ) : (
          <Paper
            bg="gray.0"
            h={250}
            mt="auto"
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
