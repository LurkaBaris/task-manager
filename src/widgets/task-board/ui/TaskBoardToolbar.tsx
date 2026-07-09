import { TASK_PRIORITY_OPTIONS, type TaskPriority } from '@/entities/task'
import { CreateColumnButton } from '@/features/create-column'
import { CreateTaskButton } from '@/features/create-task'
import { ExportTasksButton } from '@/features/export-tasks'
import { ImportTasksButton } from '@/features/import-tasks'
import { ActionsDropdown } from '@/shared/ui'
import { ActionIcon, Flex, MultiSelect, Pill, Stack, TextInput } from '@mantine/core'
import { Search, Settings } from 'lucide-react'
import styles from './TaskBoard.module.css'

const VISIBLE_PRIORITY_PILLS_COUNT = 2

interface TaskBoardToolbarProps {
  search: string
  selectedPriorities: TaskPriority[]
  disabled: boolean
  isCreateTaskDisabled: boolean
  onSearchChange: (value: string) => void
  onSelectedPrioritiesChange: (priorities: TaskPriority[]) => void
}

export const TaskBoardToolbar = ({
  search,
  selectedPriorities,
  disabled,
  isCreateTaskDisabled,
  onSearchChange,
  onSelectedPrioritiesChange,
}: TaskBoardToolbarProps) => {
  return (
    <Flex align="center" gap="md" className={styles.toolbar}>
      <TextInput
        className={styles.searchInput}
        disabled={disabled}
        leftSection={<Search size={16} strokeWidth={2} />}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        placeholder="Поиск по задачам"
        value={search}
      />

      <MultiSelect<TaskPriority>
        className={styles.prioritySelect}
        styles={{
          input: { overflow: 'hidden' },
          pillsList: {
            flexWrap: 'nowrap',
            maxWidth: '100%',
            overflowX: 'hidden',
            overflowY: 'hidden',
          },
        }}
        clearable
        data={TASK_PRIORITY_OPTIONS}
        disabled={disabled}
        onChange={onSelectedPrioritiesChange}
        placeholder={selectedPriorities.length === 0 ? 'Приоритеты' : undefined}
        renderPill={({ value, option, onRemove, disabled }) => {
          const priorityIndex = selectedPriorities.findIndex((priority) => priority === value)

          if (priorityIndex >= VISIBLE_PRIORITY_PILLS_COUNT) {
            if (priorityIndex === VISIBLE_PRIORITY_PILLS_COUNT) {
              return (
                <Pill disabled={disabled}>
                  +{selectedPriorities.length - VISIBLE_PRIORITY_PILLS_COUNT}
                </Pill>
              )
            }

            return null
          }

          return (
            <Pill disabled={disabled} onRemove={onRemove} withRemoveButton={!disabled}>
              {option?.label ?? value}
            </Pill>
          )
        }}
        value={selectedPriorities}
      />

      <ActionsDropdown
        disabled={disabled}
        trigger={
          <ActionIcon variant="light" size="lg" disabled={disabled} aria-label="Настройки доски">
            <Settings size={18} />
          </ActionIcon>
        }
      >
        <Stack gap={8}>
          <ExportTasksButton disabled={disabled} />
          <ImportTasksButton disabled={disabled} />
          <CreateColumnButton disabled={disabled} />
        </Stack>
      </ActionsDropdown>

      <CreateTaskButton disabled={isCreateTaskDisabled} />
    </Flex>
  )
}
