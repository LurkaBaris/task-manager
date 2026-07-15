import { selectTags, useTagStore } from '@/entities/tag'
import { TASK_PRIORITY_TITLE, TASK_TYPE_TITLE } from '@/entities/task'
import { Group } from '@mantine/core'
import { useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import { hasActiveTaskFilters } from '../model/helpers'
import type { TaskFilters } from '../model/types'
import { ActiveFilterPill } from './ActiveFilterPill'
import { DeleteTaskFiltersButton } from './DeleteTaskFiltersButton'

interface ActiveTaskFiltersProps {
  filters: TaskFilters
  disabled?: boolean
  onChange: (filters: TaskFilters) => void
  onReset: () => void
}

type ActiveFilterKey = keyof TaskFilters

const getFiltersWithoutValue = (filters: TaskFilters, filterKey: ActiveFilterKey): TaskFilters => ({
  priorities: filterKey === 'priorities' ? [] : filters.priorities,
  types: filterKey === 'types' ? [] : filters.types,
  tagIds: filterKey === 'tagIds' ? [] : filters.tagIds,
})

export const ActiveTaskFilters = ({
  filters,
  disabled = false,
  onChange,
  onReset,
}: ActiveTaskFiltersProps) => {
  const { tags } = useTagStore(useShallow(selectTags))

  const tagNameById = useMemo(() => {
    return new Map(tags.map((tag) => [tag.id, tag.name]))
  }, [tags])

  const activeFilters = useMemo(
    () =>
      [
        {
          key: 'tagIds',
          title: 'Теги',
          values: filters.tagIds.map((tagId) => tagNameById.get(tagId) ?? tagId),
        },
        {
          key: 'priorities',
          title: 'Приоритеты',
          values: filters.priorities.map((priority) => TASK_PRIORITY_TITLE[priority]),
        },
        {
          key: 'types',
          title: 'Типы',
          values: filters.types.map((type) => TASK_TYPE_TITLE[type]),
        },
      ] satisfies {
        key: ActiveFilterKey
        title: string
        values: string[]
      }[],
    [filters.priorities, filters.tagIds, filters.types, tagNameById],
  )

  if (!hasActiveTaskFilters(filters)) {
    return null
  }

  return (
    <Group gap="xs" w="100%" wrap="wrap">
      {activeFilters.map((filter) => (
        <ActiveFilterPill
          disabled={disabled}
          key={filter.key}
          title={filter.title}
          values={filter.values}
          onRemove={() => {
            onChange(getFiltersWithoutValue(filters, filter.key))
          }}
        />
      ))}

      <DeleteTaskFiltersButton disabled={disabled} onReset={onReset} />
    </Group>
  )
}
