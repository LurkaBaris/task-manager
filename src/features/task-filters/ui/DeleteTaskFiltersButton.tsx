import { Anchor } from '@mantine/core'
import { useShallow } from 'zustand/shallow'
import { hasActiveTaskFilters } from '../model/helpers'
import { selectTaskFilters, useTaskFilterActions, useTaskFiltersStore } from '../model/store'

interface DeleteTaskFiltersButtonProps {
  disabled?: boolean
}

export const DeleteTaskFiltersButton = ({ disabled = false }: DeleteTaskFiltersButtonProps) => {
  const filters = useTaskFiltersStore(useShallow(selectTaskFilters))
  const { resetFilters } = useTaskFilterActions()

  if (!hasActiveTaskFilters(filters)) {
    return null
  }

  return (
    <Anchor
      component="button"
      color="brand"
      disabled={disabled}
      size="xs"
      type="button"
      underline="hover"
      onClick={resetFilters}
    >
      Сбросить фильтры
    </Anchor>
  )
}
