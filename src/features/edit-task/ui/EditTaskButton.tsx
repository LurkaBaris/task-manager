import { TaskForm, useTaskActions, type Task, type TaskSchemaType } from '@/entities/task'
import { ActionIcon, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { Pencil } from 'lucide-react'

interface EditTaskButtonProps {
  task: Task
}

export const EditTaskButton = ({ task }: EditTaskButtonProps) => {
  const { updateTask } = useTaskActions()
  const [opened, { open, close }] = useDisclosure(false)

  const handleEditTask = async (values: TaskSchemaType) => {
    try {
      await updateTask(task, values)

      notifications.show({
        title: 'Обновилась задача',
        message: `Задача (id: ${task.id}) была успешно обновлена`,
        color: 'brand',
      })

      close()
    } catch {
      notifications.show({
        title: 'Не удалось обновить задачу',
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
