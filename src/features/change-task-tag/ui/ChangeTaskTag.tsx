import { selectTags, TagMetaSelect, useTagActions, useTagStore } from '@/entities/tag'
import { useTaskActions, type Task } from '@/entities/task'
import { notifications } from '@mantine/notifications'
import { useShallow } from 'zustand/shallow'

interface ChangeTaskTagProps {
  task: Task
  disabled?: boolean
}

export const ChangeTaskTag = ({ task, disabled = false }: ChangeTaskTagProps) => {
  const { tags } = useTagStore(useShallow(selectTags))
  const { updateTask } = useTaskActions()
  const { createTagIfNotExists, removeTagsIfUnused } = useTagActions()

  const applyTaskTag = async (tagId: string | undefined, successTitle: string) => {
    const previousTagId = task.tagId

    await updateTask(task, {
      tagId,
    })

    if (previousTagId && previousTagId !== tagId) {
      try {
        await removeTagsIfUnused([previousTagId])
      } catch {
        notifications.show({
          title: 'Старый тег не удален',
          message: 'Задача обновлена, но старый тег остался в списке',
          color: 'red',
        })
      }
    }

    notifications.show({
      title: successTitle,
      message: 'Изменения сохранены',
      color: 'brand',
    })
  }

  const handleTagChange = async (tagId: string | undefined) => {
    if (tagId === task.tagId) {
      return
    }

    const tag = tags.find((tag) => tag.id === tagId)

    try {
      await applyTaskTag(
        tagId,
        tagId ? `Тег изменен на «${tag?.name ?? 'Без названия'}»` : 'Тег удален',
      )
    } catch {
      notifications.show({
        title: `Не удалось обновить задачу «${task.title}»`,
        message: 'Попробуйте еще раз',
        color: 'red',
      })
    }
  }

  const handleTagCreate = async (name: string) => {
    const normalizedName = name.trim().toLowerCase()
    const existingTag = tags.find((tag) => tag.name.toLowerCase() === normalizedName)

    let createdTagId: string | undefined

    try {
      const tag = await createTagIfNotExists(name)

      if (!existingTag) {
        createdTagId = tag.id
      }

      await applyTaskTag(tag.id, `Тег изменен на «${tag.name}»`)
    } catch {
      if (createdTagId) {
        try {
          await removeTagsIfUnused([createdTagId])
        } catch {
          notifications.show({
            title: 'Не удалось удалить созданный тег',
            message: 'Тег не привязан к задаче, но остался в списке тегов',
            color: 'red',
          })
        }
      }

      notifications.show({
        title: `Не удалось обновить задачу «${task.title}»`,
        message: 'Попробуйте еще раз',
        color: 'red',
      })
    }
  }

  return (
    <TagMetaSelect
      value={task.tagId}
      disabled={disabled}
      placeholder="Укажите тег"
      onChange={handleTagChange}
      onCreate={handleTagCreate}
    />
  )
}
