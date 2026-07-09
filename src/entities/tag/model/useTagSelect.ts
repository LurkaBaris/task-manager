import { useCombobox } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import { useShallow } from 'zustand/shallow'
import { selectTags, useTagActions, useTagStore } from '../model/store'
import type { Tag } from '../model/types'

interface UseTagSelectParams {
  value?: Tag['id']
  draftValue?: string
  onChange: (tagId: Tag['id'] | undefined) => void | Promise<void>
  onCreate: (name: string) => void | Promise<void>
}

interface ClearedSnapshot {
  value?: Tag['id']
  draftValue?: string
}

const TAG_SEARCH_DEBOUNCE_MS = 250

export const useTagSelect = ({ value, draftValue, onChange, onCreate }: UseTagSelectParams) => {
  const combobox = useCombobox()
  const { tags, isLoaded } = useTagStore(useShallow(selectTags))
  const { loadTags } = useTagActions()
  const [search, setSearch] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [clearedSnapshot, setClearedSnapshot] = useState<ClearedSnapshot | null>(null)

  const normalizedDraftValue = draftValue?.trim()
  const selectedTag = tags.find((tag) => tag.id === value)
  const isLocallyCleared =
    clearedSnapshot?.value === value && clearedSnapshot?.draftValue === normalizedDraftValue
  const currentValue = isLocallyCleared ? '' : (selectedTag?.name ?? normalizedDraftValue ?? '')
  const inputValue = isEditing ? search : currentValue

  const [debouncedSearch] = useDebouncedValue(isEditing ? search : '', TAG_SEARCH_DEBOUNCE_MS)

  const trimmedSearch = debouncedSearch.trim()
  const normalizedSearch = trimmedSearch.toLowerCase()
  const isTagsLoading = !isLoaded
  const isLoading = isEditing && search !== debouncedSearch
  const hasExactTag = tags.some((tag) => tag.name.toLowerCase() === normalizedSearch)
  const canCreateTag = isEditing && Boolean(trimmedSearch) && !hasExactTag && !isLoading && isLoaded
  const canClear = Boolean(search || (!isLocallyCleared && (value || normalizedDraftValue)))

  const filteredTags = useMemo(() => {
    if (!normalizedSearch) {
      return tags
    }

    return tags.filter((tag) => tag.name.toLowerCase().includes(normalizedSearch))
  }, [normalizedSearch, tags])

  const stopEditing = () => {
    setSearch('')
    setIsEditing(false)
    combobox.closeDropdown()
  }

  useEffect(() => {
    const load = async () => {
      try {
        await loadTags()
      } catch (error) {
        console.error('Не удалось загрузить теги', error)

        notifications.show({
          title: 'Теги не загрузились',
          message: 'Попробуйте открыть список тегов еще раз',
          color: 'red',
        })
      }
    }

    load()
  }, [loadTags])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setIsEditing(true)
    combobox.openDropdown()
  }

  const handleInputFocus = () => {
    setSearch(currentValue)
    setIsEditing(true)
    combobox.openDropdown()
  }

  const handleInputBlur = () => {
    stopEditing()
  }

  const handleClearTag = async () => {
    try {
      setSearch('')
      setIsEditing(false)
      setClearedSnapshot({
        value,
        draftValue: normalizedDraftValue,
      })

      await onChange(undefined)

      combobox.closeDropdown()
    } catch (error) {
      setClearedSnapshot(null)

      console.error('Не удалось очистить тег', error)

      notifications.show({
        title: 'Тег не очистился',
        message: 'Попробуйте убрать тег еще раз',
        color: 'red',
      })
    }
  }

  const handleSelectTag = async (tagId: Tag['id']) => {
    const tag = tags.find((tag) => tag.id === tagId)

    if (!tag) {
      return
    }

    try {
      setClearedSnapshot(null)

      await onChange(tag.id)

      stopEditing()
    } catch (error) {
      console.error('Не удалось выбрать тег', error)

      notifications.show({
        title: 'Тег не выбран',
        message: 'Попробуйте выбрать тег еще раз',
        color: 'red',
      })
    }
  }

  const handleCreateTag = async () => {
    if (!canCreateTag) {
      return
    }

    try {
      setClearedSnapshot(null)

      await onCreate(trimmedSearch)

      stopEditing()
    } catch (error) {
      console.error('Не удалось создать тег', error)

      stopEditing()

      notifications.show({
        title: 'Тег не создался',
        message: 'Проверьте название тега и попробуйте еще раз',
        color: 'red',
      })
    }
  }

  const handleInputKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !canCreateTag) {
      return
    }

    event.preventDefault()

    await handleCreateTag()
  }

  return {
    combobox,
    tags,
    value,
    inputValue,
    filteredTags,
    trimmedSearch,
    isLoading,
    isTagsLoading,
    canCreateTag,
    canClear,
    handleSearchChange,
    handleInputFocus,
    handleInputBlur,
    handleClearTag,
    handleSelectTag,
    handleCreateTag,
    handleInputKeyDown,
  }
}
