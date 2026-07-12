import { selectColumns, useColumnStore } from '@/entities/column'
import {
  resolveSelectedTag,
  selectTags,
  TagSelect,
  useTagActions,
  useTagStore,
} from '@/entities/tag'
import { TaskForm, useTaskActions, type Task, type TaskSchemaType } from '@/entities/task'
import { Modal } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import { useShallow } from 'zustand/shallow'

interface EditTaskModalProps {
  task: Task
  opened: boolean
  onClose: () => void
}

export const EditTaskModal = ({ task, opened, onClose }: EditTaskModalProps) => {
  const { columns } = useColumnStore(useShallow(selectColumns))
  const { tags } = useTagStore(useShallow(selectTags))
  const { updateTask } = useTaskActions()
  const { createTagIfNotExists, removeTagsIfUnused } = useTagActions()
  const [draftTagName, setDraftTagName] = useState('')

  const handleClose = () => {
    setDraftTagName('')
    onClose()
  }

  const handleEditTask = async (values: TaskSchemaType) => {
    const previousTagId = task.tagId
    let createdTagId: string | undefined

    try {
      const resolvedTag = await resolveSelectedTag({
        selectedTagId: values.tagId,
        draftTagName,
        tags,
        createTagIfNotExists,
      })
      const tagId = resolvedTag.tag?.id

      createdTagId = resolvedTag.createdTag?.id

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
  )
}
