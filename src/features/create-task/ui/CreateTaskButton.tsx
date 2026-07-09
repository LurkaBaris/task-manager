import { selectColumns, useColumnStore } from '@/entities/column'
import { selectTags, TagSelect, useTagActions, useTagStore } from '@/entities/tag'
import {
  createTask,
  TaskForm,
  useTaskActions,
  type Task,
  type TaskSchemaType,
} from '@/entities/task'
import { Button, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import clsx from 'clsx'
import { useState } from 'react'
import { useShallow } from 'zustand/shallow'
import styles from './CreateTaskButton.module.css'

interface CreateTaskButtonProps {
  className?: string
  disabled?: boolean
}

export const CreateTaskButton = ({ className, disabled = false }: CreateTaskButtonProps) => {
  const { columns } = useColumnStore(useShallow(selectColumns))
  const { tags } = useTagStore(useShallow(selectTags))
  const { addTask, getNextPositionByColumnId } = useTaskActions()
  const { createTagIfNotExists, removeTagsIfUnused } = useTagActions()
  const [opened, { open, close }] = useDisclosure(false)
  const [draftTagName, setDraftTagName] = useState('')

  const handleClose = () => {
    setDraftTagName('')
    close()
  }

  const handleCreateTask = async (values: TaskSchemaType) => {
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

      const position = getNextPositionByColumnId(values.columnId)
      const newTask: Task = createTask({ ...values, tagId, position })

      await addTask(newTask)

      notifications.show({
        title: `Создана задача «${newTask.title}»`,
        message: 'Задача добавлена на доску',
        color: 'brand',
      })

      handleClose()
    } catch {
      if (createdTagId) {
        await removeTagsIfUnused([createdTagId])
      }

      notifications.show({
        title: `Не удалось создать задачу «${values.title}»`,
        message: 'Попробуйте еще раз',
        color: 'red',
      })
    }
  }

  return (
    <>
      <Button
        className={clsx(styles.createButton, className)}
        disabled={disabled}
        onClick={open}
        type="button"
      >
        Создать задачу
      </Button>

      <Modal centered onClose={handleClose} opened={opened} title="Создать задачу">
        <TaskForm
          columns={columns}
          onCancel={handleClose}
          onSubmit={handleCreateTask}
          renderTagField={({ value, error, disabled, onChange }) => (
            <TagSelect
              value={value}
              draftValue={draftTagName}
              label="Тег"
              error={error}
              disabled={disabled}
              placeholder="Укажите тег"
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
