import { TASK_POSITION_STEP } from '@/shared/config';
import type { Task } from './types';

const isDefined = <T>(value: T | undefined): value is T => value !== undefined;

const getTaskPositionBetween = (
  previousTask: Task | undefined,
  nextTask: Task | undefined,
): number | null => {
  const hasPreviousTask = isDefined(previousTask);
  const hasNextTask = isDefined(nextTask);

  if (!hasPreviousTask && !hasNextTask) {
    return TASK_POSITION_STEP;
  }

  if (!hasPreviousTask && hasNextTask) {
    if (nextTask.position <= 1) {
      return null;
    }

    return Math.floor(nextTask.position / 2);
  }

  if (hasPreviousTask && !hasNextTask) {
    return previousTask.position + TASK_POSITION_STEP;
  }

  if (!hasPreviousTask || !hasNextTask) {
    return null;
  }

  const gap = nextTask.position - previousTask.position;

  if (gap <= 1) {
    return null;
  }

  return previousTask.position + Math.floor(gap / 2);
};

export const sortTasksByPosition = (tasks: Task[]): Task[] =>
  [...tasks].sort(
    (a, b) =>
      a.position - b.position || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
  );

export const getNextTaskPosition = (tasks: Task[]): number => {
  const sortedTasks = sortTasksByPosition(tasks);
  const lastTask = sortedTasks.at(-1);

  return lastTask ? lastTask.position + TASK_POSITION_STEP : TASK_POSITION_STEP;
};

export const getTaskPositionAfterNormalization = (
  tasks: Task[],
  previousTask: Task | undefined,
  nextTask: Task | undefined,
): {
  position: number;
  normalizedTasks: Task[] | null;
} => {
  const position = getTaskPositionBetween(previousTask, nextTask);

  if (position !== null) {
    return { position, normalizedTasks: null };
  }

  const normalizedTasks = normalizeTaskPositions(tasks);

  const normalizedPreviousTask = previousTask
    ? normalizedTasks.find((task) => task.id === previousTask.id)
    : undefined;

  const normalizedNextTask = nextTask
    ? normalizedTasks.find((task) => task.id === nextTask.id)
    : undefined;

  const normalizedPosition = getTaskPositionBetween(normalizedPreviousTask, normalizedNextTask);

  if (normalizedPosition === null) {
    throw new Error('Не удалось изменить порядок даже после нормализации');
  }

  return {
    position: normalizedPosition,
    normalizedTasks,
  };
};

const setTaskPositionsByOrder = (tasks: Task[]): Task[] =>
  tasks.map((task, index) => ({
    ...task,
    position: (index + 1) * TASK_POSITION_STEP,
  }));

export const normalizeTaskPositions = (tasks: Task[]): Task[] =>
  setTaskPositionsByOrder(sortTasksByPosition(tasks));

export const normalizeTaskPositionsByOrder = (tasks: Task[]): Task[] =>
  setTaskPositionsByOrder(tasks);
