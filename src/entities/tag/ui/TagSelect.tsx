import { MetaCombobox } from '@/shared/ui';
import { ActionIcon, Combobox, Loader, TextInput } from '@mantine/core';
import { X } from 'lucide-react';
import type { MouseEvent } from 'react';
import type { Tag } from '../model/types';
import { useTagSelect } from '../model/useTagSelect';
import { TagOptions } from './TagOptions';

interface TagSelectProps {
  value?: Tag['id'];
  draftValue?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  onChange: (tagId: Tag['id'] | undefined) => void | Promise<void>;
  onCreate: (name: string) => void | Promise<void>;
}

export const TagSelect = ({
  value,
  draftValue,
  label,
  placeholder = 'Укажите тег',
  disabled = false,
  error,
  onChange,
  onCreate,
}: TagSelectProps) => {
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
    draftValue,
    onChange,
    onCreate,
  });

  const handleClearClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    await handleClearTag();
  };

  return (
    <MetaCombobox store={combobox} onOptionSubmit={handleSelectTag}>
      <Combobox.Target>
        <TextInput
          label={label}
          placeholder={placeholder}
          value={inputValue}
          error={error}
          disabled={disabled}
          data-no-dnd
          rightSection={
            isLoading || isTagsLoading ? (
              <Loader size={14} color="brand" />
            ) : canClear ? (
              <ActionIcon
                variant="subtle"
                color="brand"
                size="sm"
                radius="xl"
                disabled={disabled}
                data-no-dnd
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleClearClick}
              >
                <X size={14} />
              </ActionIcon>
            ) : null
          }
          styles={{
            label: {
              color: 'light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-1))',
              fontSize: 14,
              fontWeight: 600,
            },
            input: {
              backgroundColor: 'transparent',
              fontSize: 13,
            },
          }}
          onChange={(event) => handleSearchChange(event.currentTarget.value)}
          onClick={() => {
            if (!disabled) {
              combobox.openDropdown();
            }
          }}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
        />
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
  );
};
