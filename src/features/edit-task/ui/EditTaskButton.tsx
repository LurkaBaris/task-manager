import { selectColumns, useColumnStore } from '@/entities/column'
import { selectTags, TagSelect, useTagActions, useTagStore } from '@/entities/tag'
import { TaskForm, useTaskActions, type Task, type TaskSchemaType } from '@/entities/task'
import { ActionIcon, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { useShallow } from 'zustand/shallow'

interface EditTaskButtonProps {
  task: Task
  disabled?: boolean
}

export const EditTaskButton = ({ task, disabled }: EditTaskButtonProps) => {
  const { columns } = useColumnStore(useShallow(selectColumns))
  const { tags } = useTagStore(useShallow(selectTags))
  const { updateTask } = useTaskActions()
  const { createTagIfNotExists, removeTagsIfUnused } = useTagActions()
  const [opened, { open, close }] = useDisclosure(false)
  const [draftTagName, setDraftTagName] = useState('')

  const handleClose = () => {
    setDraftTagName('')
    close()
  }

  const handleEditTask = async (values: TaskSchemaType) => {
    const previousTagId = task.tagId
    const normalizedDraftTagName = draftTagName.trim()
    const existingTag = tags.find(
      (tag) => tag.name.toLowerCase() === normalizedDraftTagName.toLowerCase(),
    )

    let tagId = values.tagId
    let createdTagId: string | undefined

    try {
      if (!tagId && normalizedDraftTagName) {
        const tag = await createTagIfNotExists(normalizedDraftTagName)

        tagId = tag.id

        if (!existingTag) {
          createdTagId = tag.id
        }
      }

      await updateTask(task, {
        ...values,
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
        title: `Обновлена задача «${values.title}»`,
        message: 'Изменения сохранены',
        color: 'brand',
      })

      handleClose()
    } catch {
      if (createdTagId) {
        try {
          await removeTagsIfUnused([createdTagId])
        } catch {
          notifications.show({
            title: 'Не удалось удалить созданный тег',
            message: 'Тег не привязан к задаче, но остался в списке',
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
    <>
      <ActionIcon
        onClick={open}
        type="button"
        aria-label="Редактировать задачу"
        title="Редактировать"
        size="md"
        radius="md"
        data-no-dnd
        disabled={disabled}
      >
        <Pencil size={16} strokeWidth={2} data-no-dnd />
      </ActionIcon>

      <Modal centered onClose={handleClose} opened={opened} title="Редактировать задачу">
        <TaskForm
          columns={columns}
          onCancel={handleClose}
          onSubmit={handleEditTask}
          defaultValues={task}
          submitLabel="Обновить"
          renderTagField={({ value, error, disabled, onChange }) => (
            <TagSelect
              value={value}
              draftValue={draftTagName}
              label="Тег"
              error={error}
              disabled={disabled}
              placeholder="Введите тег"
              onChange={(tagId) => {
                setDraftTagName('')
                onChange(tagId)
              }}
              onCreate={(name) => {
                setDraftTagName(name)
                onChange(undefined)
              }}
            />
          )}
        />
      </Modal>
    </>
  )
}
