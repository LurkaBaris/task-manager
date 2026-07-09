import { Button, CheckIcon, Combobox, Group, Loader, Text } from '@mantine/core'
import { Plus } from 'lucide-react'
import type { MouseEvent } from 'react'
import type { Tag } from '../model/types'

interface TagOptionsProps {
  value?: Tag['id']
  filteredTags: Tag[]
  trimmedSearch: string
  isTagsLoading: boolean
  isLoading: boolean
  canCreateTag: boolean
  onCreate: () => void | Promise<void>
}

export const TagOptions = ({
  value,
  filteredTags,
  trimmedSearch,
  isTagsLoading,
  isLoading,
  canCreateTag,
  onCreate,
}: TagOptionsProps) => {
  const handleCreateMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleCreateClick = () => {
    onCreate()
  }

  return (
    <Combobox.Options data-no-dnd>
      {isTagsLoading && (
        <Group gap={8} px={10} py={8} wrap="nowrap" data-no-dnd>
          <Loader size={16} color="brand" />

          <Text size="sm" c="dimmed">
            Загрузка тегов...
          </Text>
        </Group>
      )}

      {!isTagsLoading && isLoading && (
        <Group gap={8} px={10} py={8} wrap="nowrap" data-no-dnd>
          <Loader size={16} color="brand" />

          <Text size="sm" c="dimmed">
            Поиск...
          </Text>
        </Group>
      )}

      {!isTagsLoading && !isLoading && (
        <>
          {filteredTags.map((tag) => (
            <Combobox.Option key={tag.id} value={tag.id} px={10} py={6} data-no-dnd>
              <Group justify="space-between" gap={8} wrap="nowrap">
                <Text size="sm" truncate>
                  {tag.name}
                </Text>

                {tag.id === value && <CheckIcon size={12} />}
              </Group>
            </Combobox.Option>
          ))}

          {canCreateTag && (
            <Button
              fullWidth
              variant="light"
              color="brand"
              size="xs"
              radius="md"
              justify="flex-start"
              leftSection={<Plus size={14} />}
              data-no-dnd
              h="auto"
              px={10}
              py={6}
              mt={filteredTags.length && 4}
              onMouseDown={handleCreateMouseDown}
              onClick={handleCreateClick}
            >
              <Text size="sm" fw={500} truncate>
                Создать тег «{trimmedSearch}»
              </Text>
            </Button>
          )}

          {!filteredTags.length && !canCreateTag && (
            <Combobox.Empty>Теги не найдены</Combobox.Empty>
          )}
        </>
      )}
    </Combobox.Options>
  )
}
