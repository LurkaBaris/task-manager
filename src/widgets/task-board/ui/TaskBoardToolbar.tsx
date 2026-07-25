import { CreateColumnButton } from '@/features/create-column';
import { CreateTaskButton } from '@/features/create-task';
import { ExportTasksButton } from '@/features/export-tasks';
import { ImportTasksButton } from '@/features/import-tasks';
import { ActiveTaskFilters, TaskFiltersButton, type TaskFilters } from '@/features/task-filters';
import { ActionsDropdown } from '@/shared/ui';
import { ActionIcon, Flex, Stack, TextInput } from '@mantine/core';
import { Search, Settings } from 'lucide-react';
import styles from './TaskBoard.module.css';

interface TaskBoardToolbarProps {
  search: string;
  filters: TaskFilters;
  disabled: boolean;
  isCreateTaskDisabled: boolean;
  onSearchChange: (value: string) => void;
  onFiltersChange: (filters: TaskFilters) => void;
  onFiltersReset: () => void;
}

export const TaskBoardToolbar = ({
  search,
  filters,
  disabled,
  isCreateTaskDisabled,
  onSearchChange,
  onFiltersChange,
  onFiltersReset,
}: TaskBoardToolbarProps) => {
  return (
    <Stack gap="xs">
      <Flex align="center" gap="md" className={styles.toolbar}>
        <TextInput
          className={styles.searchInput}
          disabled={disabled}
          leftSection={<Search size={16} strokeWidth={2} />}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          placeholder="Поиск по задачам"
          value={search}
        />

        <TaskFiltersButton disabled={disabled} filters={filters} onChange={onFiltersChange} />

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

      <ActiveTaskFilters
        disabled={disabled}
        filters={filters}
        onChange={onFiltersChange}
        onReset={onFiltersReset}
      />
    </Stack>
  );
};
