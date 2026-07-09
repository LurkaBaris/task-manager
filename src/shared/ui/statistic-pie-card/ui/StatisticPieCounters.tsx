import { Box, Group, Paper, ScrollArea, Text } from '@mantine/core'
import type { StatisticPieItem } from '../model/types'

interface StatisticPieCountersProps {
  items: StatisticPieItem[]
  onItemMouseEnter: (item: StatisticPieItem) => void
  onItemMouseLeave: () => void
}

export const StatisticPieCounters = ({
  items,
  onItemMouseEnter,
  onItemMouseLeave,
}: StatisticPieCountersProps) => {
  return (
    <ScrollArea offsetScrollbars="x" scrollbarSize={6} type="hover">
      <Group gap="xs" miw="100%" pb={4} w="max-content" wrap="nowrap" justify="center">
        {items.map((item) => {
          const isMuted = item.count === 0

          return (
            <Paper
              key={item.id}
              bg={isMuted ? 'gray.0' : 'white'}
              flex="0 0 180px"
              opacity={isMuted ? 0.55 : 1}
              px="sm"
              py={7}
              radius="md"
              withBorder
              style={{
                cursor: isMuted ? 'default' : 'pointer',
              }}
              onMouseEnter={() => {
                onItemMouseEnter(item)
              }}
              onMouseLeave={onItemMouseLeave}
            >
              <Group gap="xs" wrap="nowrap">
                <Box
                  bg={item.color}
                  h={10}
                  w={10}
                  style={{
                    borderRadius: '50%',
                    flexShrink: 0,
                  }}
                />

                <Text c="gray.7" fw={600} miw={0} size="sm" truncate>
                  {item.label}
                </Text>

                <Text c="gray.9" fw={700} ml="auto" size="sm">
                  {item.count}
                </Text>
              </Group>
            </Paper>
          )
        })}
      </Group>
    </ScrollArea>
  )
}
