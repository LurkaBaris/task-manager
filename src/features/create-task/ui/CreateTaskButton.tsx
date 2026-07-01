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
import styles from './CreateTaskButton.module.css'

interface CreateTaskButtonProps {
  className?: string
}

export const CreateTaskButton = ({ className }: CreateTaskButtonProps) => {
  const { addTask } = useTaskActions()
  const [opened, { open, close }] = useDisclosure(false)

  const handleCreateTask = (values: TaskSchemaType) => {
    const newTask: Task = createTask(values)

    addTask(newTask)

    notifications.show({
      title: 'Задача создана',
      message: `Новая задача добавлена, у нее id: ${newTask.id}`,
      color: 'brand',
    })

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
