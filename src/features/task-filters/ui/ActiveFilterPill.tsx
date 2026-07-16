import { Flex, Pill, Text } from '@mantine/core'
import { VISIBLE_ACTIVE_FILTER_VALUES_COUNT } from '../model/contstants'
import styles from './ActiveFilterPill.module.css'

interface ActiveFilterPillProps {
  title: string
  values: string[]
  disabled?: boolean
  onRemove: () => void
}

export const ActiveFilterPill = ({
  title,
  values,
  disabled = false,
  onRemove,
}: ActiveFilterPillProps) => {
  const visibleValues = values.slice(0, VISIBLE_ACTIVE_FILTER_VALUES_COUNT)
  const hiddenValuesCount = values.length - visibleValues.length

  if (values.length === 0) {
    return null
  }

  return (
    <Pill
      className={styles.pill}
      disabled={disabled}
      onRemove={onRemove}
      withRemoveButton={!disabled}
    >
      <Flex className={styles.content} align="center" gap={6} wrap="nowrap">
        <Text className={styles.title} c="dimmed" fw={600} size="xs" span>
          {title}:
        </Text>

        <Flex className={styles.values} align="center" gap={2} wrap="nowrap">
          {visibleValues.map((value) => (
            <span className={styles.value} key={value}>
              {value}
            </span>
          ))}

          {hiddenValuesCount > 0 && <span className={styles.count}>+{hiddenValuesCount}</span>}
        </Flex>
      </Flex>
    </Pill>
  )
}
