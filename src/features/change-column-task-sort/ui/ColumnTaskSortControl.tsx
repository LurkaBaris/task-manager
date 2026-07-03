import { SegmentedControl } from '@mantine/core'
import { isTaskSortOrder, TASK_SORT_ORDER, type TaskSortOrder } from '../model/sort'

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
    w="100%"
    aria-label="Порядок сортировки задач"
    color="brand"
    data={[
      { label: 'Новые', value: TASK_SORT_ORDER.Newest },
      { label: 'Старые', value: TASK_SORT_ORDER.Oldest },
      { label: 'Мой порядок', value: TASK_SORT_ORDER.Manual },
    ]}
    disabled={disabled}
    onChange={(value) => isTaskSortOrder(value) && onChange(value)}
    radius="md"
    size="xs"
    value={sortOrder}
  />
)
