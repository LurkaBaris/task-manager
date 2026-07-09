import { selectTags, useTagActions, useTagStore, type Tag } from '@/entities/tag'
import {
  TASK_PRIORITY_OPTIONS,
  TASK_TYPE_OPTIONS,
  type TaskPriority,
  type TaskType,
} from '@/entities/task'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Divider,
  Group,
  Loader,
  MultiSelect,
  Pill,
  Popover,
  Stack,
  Text,
  type MultiSelectProps,
} from '@mantine/core'
import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useShallow } from 'zustand/shallow'
import { VISIBLE_SELECT_FILTER_PILLS_COUNT } from '../model/contstants'
import { getActiveTaskFiltersCount, hasActiveTaskFilters } from '../model/helpers'
import { selectTaskFilters, useTaskFilterActions, useTaskFiltersStore } from '../model/store'
import { taskFiltersSchema, type TaskFiltersSchemaType } from '../model/taskFiltersSchema'
import styles from './TaskFiltersButton.module.css'

interface TaskFiltersButtonProps {
  disabled?: boolean
}

const EMPTY_FILTERS: TaskFiltersSchemaType = {
  priorities: [],
  types: [],
  tagIds: [],
}

const getLimitedPillRenderer = (
  selectedValues: readonly string[],
): NonNullable<MultiSelectProps['renderPill']> => {
  return ({ value, option, onRemove, disabled }) => {
    const selectedValueIndex = selectedValues.findIndex((selectedValue) => selectedValue === value)

    if (selectedValueIndex === -1) {
      return null
    }

    if (selectedValueIndex > VISIBLE_SELECT_FILTER_PILLS_COUNT) {
      return null
    }

    if (selectedValueIndex === VISIBLE_SELECT_FILTER_PILLS_COUNT) {
      return (
        <Pill className={styles.countPill} disabled={disabled} size="sm">
          +{selectedValues.length - VISIBLE_SELECT_FILTER_PILLS_COUNT}
        </Pill>
      )
    }

    return (
      <Pill
        className={styles.selectPill}
        disabled={disabled}
        onRemove={onRemove}
        size="sm"
        withRemoveButton={!disabled}
      >
        <span className={styles.selectPillText}>{option.label}</span>
      </Pill>
    )
  }
}

export const TaskFiltersButton = ({ disabled = false }: TaskFiltersButtonProps) => {
  const [opened, setOpened] = useState(false)
  const filters = useTaskFiltersStore(useShallow(selectTaskFilters))
  const { setFilters } = useTaskFilterActions()
  const { tags, isLoaded } = useTagStore(useShallow(selectTags))
  const { loadTags } = useTagActions()
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<TaskFiltersSchemaType>({
    resolver: zodResolver(taskFiltersSchema),
    defaultValues: EMPTY_FILTERS,
    mode: 'onChange',
  })

  const tagOptions = useMemo(() => {
    return tags.map((tag: Tag) => ({
      value: tag.id,
      label: tag.name,
    }))
  }, [tags])

  const draftPriorities = useWatch({
    control,
    name: 'priorities',
  })

  const draftTypes = useWatch({
    control,
    name: 'types',
  })

  const draftTagIds = useWatch({
    control,
    name: 'tagIds',
  })

  const draftFilters: TaskFiltersSchemaType = {
    priorities: draftPriorities ?? EMPTY_FILTERS.priorities,
    types: draftTypes ?? EMPTY_FILTERS.types,
    tagIds: draftTagIds ?? EMPTY_FILTERS.tagIds,
  }

  const hasDraftFilters = hasActiveTaskFilters(draftFilters)
  const activeFiltersCount = getActiveTaskFiltersCount(filters)

  useEffect(() => {
    if (!opened) {
      return
    }

    reset(filters)
  }, [filters, opened, reset])

  const handleLoadTags = () => {
    if (isLoaded) {
      return
    }

    loadTags()
  }

  const handleApplyFilters = handleSubmit((values) => {
    setFilters(values)
    setOpened(false)
  })

  const handleResetDraftFilters = () => {
    reset(EMPTY_FILTERS)
  }

  const handleCancelFilters = () => {
    reset(filters)
    setOpened(false)
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      radius="md"
      shadow="md"
      width={360}
      withinPortal
    >
      <Popover.Target>
        <Box component="span" className={styles.filtersButtonWrapper}>
          <Button
            color="brand"
            disabled={disabled}
            leftSection={<SlidersHorizontal size={16} />}
            rightSection={<ChevronDown size={14} />}
            variant="light"
            onClick={() => {
              setOpened((currentOpened) => !currentOpened)
            }}
          >
            Фильтры
          </Button>

          {activeFiltersCount > 0 && (
            <span className={styles.filtersCount}>{activeFiltersCount}</span>
          )}
        </Box>
      </Popover.Target>

      <Popover.Dropdown p="md">
        <Box
          component="form"
          onSubmit={(event) => {
            handleApplyFilters(event)
          }}
        >
          <Stack gap="sm">
            <Group justify="space-between" wrap="nowrap">
              <Text fw={600} size="sm">
                Фильтры задач
              </Text>

              <Button
                disabled={!hasDraftFilters || disabled}
                leftSection={<RotateCcw size={14} />}
                size="xs"
                type="button"
                variant="subtle"
                onClick={handleResetDraftFilters}
              >
                Сбросить
              </Button>
            </Group>

            <Divider />

            <Controller
              control={control}
              name="priorities"
              render={({ field, fieldState }) => (
                <MultiSelect<TaskPriority>
                  clearable
                  classNames={{
                    input: styles.input,
                    inputField:
                      field.value.length > 0 ? styles.inputFieldCollapsed : styles.inputField,
                    label: styles.label,
                    pillsList: styles.pillsList,
                  }}
                  comboboxProps={{
                    withinPortal: false,
                  }}
                  data={TASK_PRIORITY_OPTIONS}
                  disabled={disabled}
                  error={fieldState.error?.message}
                  label="Приоритеты"
                  placeholder={field.value.length === 0 ? 'Выберите приоритеты' : undefined}
                  renderPill={getLimitedPillRenderer(field.value)}
                  searchable
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="types"
              render={({ field, fieldState }) => (
                <MultiSelect<TaskType>
                  clearable
                  classNames={{
                    input: styles.input,
                    inputField:
                      field.value.length > 0 ? styles.inputFieldCollapsed : styles.inputField,
                    label: styles.label,
                    pillsList: styles.pillsList,
                  }}
                  comboboxProps={{
                    withinPortal: false,
                  }}
                  data={TASK_TYPE_OPTIONS}
                  disabled={disabled}
                  error={fieldState.error?.message}
                  label="Типы"
                  placeholder={field.value.length === 0 ? 'Выберите типы' : undefined}
                  renderPill={getLimitedPillRenderer(field.value)}
                  searchable
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="tagIds"
              render={({ field, fieldState }) => (
                <MultiSelect<Tag['id']>
                  clearable
                  classNames={{
                    input: styles.input,
                    inputField:
                      field.value.length > 0 ? styles.inputFieldCollapsed : styles.inputField,
                    label: styles.label,
                    pillsList: styles.pillsList,
                  }}
                  comboboxProps={{
                    withinPortal: false,
                  }}
                  data={tagOptions}
                  disabled={disabled}
                  error={fieldState.error?.message}
                  label="Теги"
                  nothingFoundMessage="Теги не найдены"
                  placeholder={field.value.length === 0 ? 'Выберите теги' : undefined}
                  renderPill={getLimitedPillRenderer(field.value)}
                  rightSection={!isLoaded ? <Loader color="brand" size={14} /> : undefined}
                  searchable
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  onClick={handleLoadTags}
                  onFocus={handleLoadTags}
                />
              )}
            />

            <Group justify="flex-end" mt="xs">
              <Button
                disabled={disabled}
                type="button"
                variant="default"
                onClick={handleCancelFilters}
              >
                Отмена
              </Button>

              <Button disabled={disabled || !isValid} type="submit">
                Применить
              </Button>
            </Group>
          </Stack>
        </Box>
      </Popover.Dropdown>
    </Popover>
  )
}
