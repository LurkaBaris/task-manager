import { pluralize } from '@/shared/lib'
import { Stack, Text } from '@mantine/core'
import { Doughnut } from 'react-chartjs-2'
import { doughnutChartOptions } from '../model/chartOptions'
import type { StatisticPieItem } from '../model/types'
import { useStatisticChart } from '../model/useStatisticChart'
import { StatisticChartCard } from './StatisticChartCard'
import styles from './StatisticCard.module.css'

interface StatisticDoughnutCardProps {
  title: string
  description: string
  items: StatisticPieItem[]
}

export const StatisticDoughnutCard = ({
  title,
  description,
  items,
}: StatisticDoughnutCardProps) => {
  const {
    chartData,
    chartRef,
    handleLegendItemMouseEnter,
    handleLegendItemMouseLeave,
    total,
    visibleItems,
    visibleTotal,
  } = useStatisticChart<'doughnut'>(items)

  return (
    <StatisticChartCard
      description={description}
      title={title}
      total={total}
      visibleItems={visibleItems}
      visibleTotal={visibleTotal}
      onLegendItemMouseEnter={handleLegendItemMouseEnter}
      onLegendItemMouseLeave={handleLegendItemMouseLeave}
    >
      <Doughnut ref={chartRef} data={chartData} options={doughnutChartOptions} />

      <Stack
        align="center"
        className={styles.chartCenter}
        gap={0}
        inset={0}
        justify="center"
        pos="absolute"
        style={{ pointerEvents: 'none' }}
      >
        <Text
          c="light-dark(var(--mantine-color-gray-9), var(--mantine-color-dark-0))"
          fw={700}
          size="xl"
        >
          {total}
        </Text>

        <Text c="dimmed" size="xs">
          {pluralize(total, ['задача', 'задачи', 'задач'])} всего
        </Text>
      </Stack>
    </StatisticChartCard>
  )
}
