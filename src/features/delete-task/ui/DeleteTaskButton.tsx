import type { Task } from '@/entities/task'
import type { ActionIconProps } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { DeleteTaskAction } from './DeleteTaskAction'
import { DeleteTaskModal } from './DeleteTaskModal'

interface DeleteTaskButtonProps {
  task: Task
  disabled?: boolean
  onDeleted?: () => void
  onRestored?: () => void
  size?: ActionIconProps['size']
  variant?: ActionIconProps['variant']
  iconSize?: number
}

export const DeleteTaskButton = ({
  task,
  disabled,
  onDeleted,
  onRestored,
  size,
  variant,
  iconSize,
}: DeleteTaskButtonProps) => {
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <DeleteTaskAction
        disabled={disabled}
        iconSize={iconSize}
        size={size}
        variant={variant}
        onClick={open}
      />

      {opened && (
        <DeleteTaskModal
          task={task}
          opened
          onClose={close}
          onDeleted={onDeleted}
          onRestored={onRestored}
        />
      )}
    </>
  )
}
