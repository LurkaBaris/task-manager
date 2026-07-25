import { TaskCard, type Task } from '@/entities/task';
import { ChangeTaskPrioritySelect } from '@/features/change-task-priority';
import { ChangeTaskStatusSelect } from '@/features/change-task-status';
import { ChangeTaskTag } from '@/features/change-task-tag';
import { ChangeTaskType } from '@/features/change-task-type';
import { DeleteTaskAction } from '@/features/delete-task';
import { EditTaskAction } from '@/features/edit-task';
import { SortableTask } from '@/features/task-dnd';
import { memo } from 'react';

interface TaskBoardTaskProps {
  task: Task;
  disabled: boolean;
  isTaskDndDisabled: boolean;
  normalizedSearch: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export const TaskBoardTask = memo(function TaskBoardTask({
  task,
  disabled,
  isTaskDndDisabled,
  normalizedSearch,
  onEditTask,
  onDeleteTask,
}: TaskBoardTaskProps) {
  return (
    <SortableTask disabled={isTaskDndDisabled} task={task}>
      <TaskCard
        search={normalizedSearch}
        task={task}
        headerActions={
          <>
            <DeleteTaskAction onClick={() => onDeleteTask(task)} />
            <EditTaskAction onClick={() => onEditTask(task)} />
          </>
        }
        metaItems={[
          {
            label: 'Тег',
            content: <ChangeTaskTag task={task} disabled={disabled} />,
          },
          {
            label: 'Тип',
            content: <ChangeTaskType task={task} disabled={disabled} />,
          },
        ]}
        footerActions={
          <>
            <ChangeTaskStatusSelect task={task} disabled={disabled} />
            <ChangeTaskPrioritySelect task={task} disabled={disabled} />
          </>
        }
      />
    </SortableTask>
  );
});
