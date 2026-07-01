import { taskActions, TaskForm, type Task, type TaskSchemaType } from '@/entities/task'
import { Button, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import clsx from 'clsx'
import styles from './CreateTaskButton.module.css'

interface CreateTaskButtonProps {
  onCreate?: (newTask: Task) => void
  className?: string
}

export const CreateTaskButton = ({ onCreate, className }: CreateTaskButtonProps) => {
  const [opened, { open, close }] = useDisclosure(false)

  const handleCreateTask = (values: TaskSchemaType) => {
    const newTask: Task = {
      id: `task-${window.crypto.randomUUID()}`,
      title: values.title,
      description: values.description,
      columnId: values.columnId,
      priority: values.priority,
      createdAt: new Date().toISOString(),
    }

    taskActions.addTask(newTask)
    onCreate?.(newTask)

    close()
  }

  return (
    <>
      <Button className={clsx(styles.createButton, className)} onClick={open} type="button">
        Создать задачу
      </Button>

      <Modal centered onClose={close} opened={opened} title="Создать задачу">
        <TaskForm onCancel={close} onSubmit={handleCreateTask} />
      </Modal>
    </>
  )
}
