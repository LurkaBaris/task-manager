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
  disabled?: boolean
}

export const CreateTaskButton = ({ className, disabled = false }: CreateTaskButtonProps) => {
  const { addTask, getNextPositionByColumnId } = useTaskActions()
  const [opened, { open, close }] = useDisclosure(false)

  const handleCreateTask = async (values: TaskSchemaType) => {
    const position = getNextPositionByColumnId(values.columnId)
    const newTask: Task = createTask({ ...values, position })

    try {
      await addTask(newTask)

      notifications.show({
        title: 'Задача создана',
        message: `Новая задача добавлена, у нее id: ${newTask.id}`,
        color: 'brand',
      })

      close()
    } catch {
      notifications.show({
        title: 'Не удалось создать задачу',
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

      <Modal centered onClose={close} opened={opened} title="Создать задачу">
        <TaskForm onCancel={close} onSubmit={handleCreateTask} />
      </Modal>
    </>
  )
}
