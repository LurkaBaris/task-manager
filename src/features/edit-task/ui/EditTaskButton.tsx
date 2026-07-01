import { taskActions, TaskForm, type Task, type TaskSchemaType } from '@/entities/task'
import { ActionIcon, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Pencil } from 'lucide-react'

interface EditTaskButtonProps {
  task: Task
}

export const EditTaskButton = ({ task }: EditTaskButtonProps) => {
  const [opened, { open, close }] = useDisclosure(false)

  const handleEditTask = (values: TaskSchemaType) => {
    taskActions.updateTask(task.id, values)
    close()
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
      >
        <Pencil size={16} strokeWidth={2} />
      </ActionIcon>

      <Modal centered onClose={close} opened={opened} title="Редактировать задачу">
        <TaskForm
          onCancel={close}
          onSubmit={handleEditTask}
          defaultValues={task}
          submitLabel="Обновить"
        />
      </Modal>
    </>
  )
}
