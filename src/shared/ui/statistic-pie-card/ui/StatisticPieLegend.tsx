import { Box, Text, UnstyledButton } from '@mantine/core'
import type { StatisticPieItem } from '../model/types'
import styles from './StatisticCard.module.css'

interface StatisticPieLegendProps {
  items: StatisticPieItem[]
  total: number
  onItemMouseEnter: (item: StatisticPieItem) => void
  onItemMouseLeave: () => void
}

const getPercent = (count: number, total: number): number => {
  if (total === 0) {
    return 0
  }

  return Math.round((count / total) * 100)
}

export const StatisticPieLegend = ({
  items,
  total,
  onItemMouseEnter,
  onItemMouseLeave,
}: StatisticPieLegendProps) => {
  return (
    <Box className={styles.legend}>
      <Box className={styles.legendHeader} pb={4} px={14}>
        <Text className={styles.legendTitle} c="dimmed" fw={600} size="xs" tt="uppercase">
          Топ 5
        </Text>

        <Text c="dimmed" fw={600} size="xs" ta="right">
          Задач
        </Text>

        <Text c="dimmed" fw={600} size="xs" ta="right">
          Доля
        </Text>
      </Box>

      {items.map((item) => (
        <UnstyledButton
          key={item.id}
          aria-label={`${item.label}: ${item.count}`}
          className={styles.legendItem}
          h={40}
          px={14}
          py={8}
          onBlur={onItemMouseLeave}
          onFocus={() => {
            onItemMouseEnter(item)
          }}
          onMouseEnter={() => {
            onItemMouseEnter(item)
          }}
          onMouseLeave={onItemMouseLeave}
        >
          <Box
            bg={item.color}
            h={9}
            w={9}
            style={{
              borderRadius: '50%',
            }}
          />

          <Text
            c="light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-1))"
            fw={600}
            miw={0}
            size="sm"
            truncate
          >
            {item.label}
          </Text>

          <Text
            c="light-dark(var(--mantine-color-gray-9), var(--mantine-color-dark-0))"
            fw={700}
            size="sm"
            ta="right"
          >
            {item.count}
          </Text>

          <Text c="dimmed" fw={500} size="sm" ta="right">
            {getPercent(item.count, total)}%
          </Text>
        </UnstyledButton>
      ))}
    </Box>
  )
}
