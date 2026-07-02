import { SegmentedControl } from '@mantine/core'
import { TASK_SORT_ORDER, type TaskSortOrder } from '../model/sort'

interface ColumnTaskSortControlProps {
  disabled?: boolean
  sortOrder: TaskSortOrder
  onChange: (sortOrder: TaskSortOrder) => void
}

export const ColumnTaskSortControl = ({
  disabled,
  sortOrder,
  onChange,
}: ColumnTaskSortControlProps) => (
  <SegmentedControl
    aria-label="Порядок сортировки задач"
    color="brand"
    data={[
      { label: 'Новые', value: TASK_SORT_ORDER.Newest },
      { label: 'Старые', value: TASK_SORT_ORDER.Oldest },
    ]}
    disabled={disabled}
    onChange={(value) =>
      onChange(value === TASK_SORT_ORDER.Newest ? TASK_SORT_ORDER.Newest : TASK_SORT_ORDER.Oldest)
    }
    radius="md"
    size="xs"
    value={sortOrder}
  />
)
