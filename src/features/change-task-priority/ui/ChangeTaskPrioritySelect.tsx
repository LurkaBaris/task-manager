import {
  BadgeSelect,
  TASK_PRIORITY_COLOR,
  TASK_PRIORITY_OPTIONS,
  useTaskActions,
  type Task,
} from '@/entities/task';
import { notifications } from '@mantine/notifications';

interface ChangeTaskPrioritySelectProps {
  task: Task;
  disabled?: boolean;
}

export const ChangeTaskPrioritySelect = ({
  task,
  disabled = false,
}: ChangeTaskPrioritySelectProps) => {
  const { updateTask } = useTaskActions();

  const handleSelect = async (priority: Task['priority']) => {
    const option = TASK_PRIORITY_OPTIONS.find((option) => option.value === priority);

    try {
      await updateTask(task, { priority });

      notifications.show({
        title: `Приоритет изменен на «${option?.label ?? 'Без названия'}»`,
        message: 'Изменения сохранены',
        color: 'brand',
      });
    } catch {
      notifications.show({
        title: `Не удалось обновить задачу «${task.title}»`,
        message: 'Попробуйте еще раз',
        color: 'red',
      });
    }
  };

  return (
    <BadgeSelect
      value={task.priority}
      disabled={disabled}
      width={160}
      options={TASK_PRIORITY_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        color: TASK_PRIORITY_COLOR[option.value],
      }))}
      onChange={handleSelect}
    />
  );
};
