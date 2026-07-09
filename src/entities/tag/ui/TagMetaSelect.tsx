import { MetaCombobox, metaControlChevronStyles, MetaControlInput } from '@/shared/ui'
import { ActionIcon, Box, Combobox, Loader } from '@mantine/core'
import { ChevronDown, X } from 'lucide-react'
import type { MouseEvent } from 'react'
import type { Tag } from '../model/types'
import { useTagSelect } from '../model/useTagSelect'
import { TagOptions } from './TagOptions'

interface TagMetaSelectProps {
  value?: Tag['id']
  placeholder?: string
  disabled?: boolean
  onChange: (tagId: Tag['id'] | undefined) => void | Promise<void>
  onCreate: (name: string) => void | Promise<void>
}

export const TagMetaSelect = ({
  value,
  placeholder = 'Укажите тег',
  disabled = false,
  onChange,
  onCreate,
}: TagMetaSelectProps) => {
  const {
    combobox,
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
  } = useTagSelect({
    value,
    onChange,
    onCreate,
  })

  const displayValue = inputValue.trim() || placeholder

  const handleOpenDropdown = () => {
    if (disabled) {
      return
    }

    handleInputFocus()
    combobox.openDropdown()
  }

  const handleClearClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    await handleClearTag()
  }

  const handleOptionSubmit = async (optionValue: string) => {
    if (canCreateTag && optionValue === trimmedSearch) {
      await handleCreateTag()
      return
    }

    await handleSelectTag(optionValue)
  }

  return (
    <MetaCombobox store={combobox} onOptionSubmit={handleOptionSubmit}>
      <Combobox.Target>
        <Box data-no-dnd style={{ display: 'inline-flex' }}>
          <MetaControlInput
            displayValue={displayValue}
            placeholder={placeholder}
            value={inputValue}
            disabled={disabled}
            data-no-dnd
            rightSection={
              isLoading || isTagsLoading ? (
                <Loader size={12} color="brand" />
              ) : canClear ? (
                <ActionIcon
                  variant="subtle"
                  color="brand"
                  size="xs"
                  radius="xl"
                  disabled={disabled}
                  data-no-dnd
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleClearClick}
                >
                  <X size={11} />
                </ActionIcon>
              ) : (
                <Box component="span" data-no-dnd style={metaControlChevronStyles}>
                  <ChevronDown size={14} strokeWidth={2} />
                </Box>
              )
            }
            onChange={(event) => handleSearchChange(event.currentTarget.value)}
            onClick={handleOpenDropdown}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
          />
        </Box>
      </Combobox.Target>

      <Combobox.Dropdown data-no-dnd>
        <TagOptions
          value={value}
          filteredTags={filteredTags}
          trimmedSearch={trimmedSearch}
          isTagsLoading={isTagsLoading}
          isLoading={isLoading}
          canCreateTag={canCreateTag}
          onCreate={handleCreateTag}
        />
      </Combobox.Dropdown>
    </MetaCombobox>
  )
}
