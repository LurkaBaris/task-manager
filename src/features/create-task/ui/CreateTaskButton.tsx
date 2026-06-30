import type { Task } from '@/entities/task'
import { Button, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import clsx from 'clsx'
import styles from './CreateTaskButton.module.css'
import { CreateTaskForm } from './CreateTaskForm'

interface CreateTaskButtonProps {
  onCreate?: (newTask: Task) => void
  className?: string
}

export const CreateTaskButton = ({ onCreate, className }: CreateTaskButtonProps) => {
  const [opened, { open, close }] = useDisclosure(false)

  const handleCreateTask = (newTask: Task) => {
    onCreate?.(newTask)
    close()
  }

  return (
    <>
      <Button className={clsx(styles.createButton, className)} onClick={open} type="button">
        Создать задачу
      </Button>

      <Modal centered onClose={close} opened={opened} title="Создать задачу">
        <CreateTaskForm onCancel={close} onCreate={handleCreateTask} />
      </Modal>
    </>
  )
}
