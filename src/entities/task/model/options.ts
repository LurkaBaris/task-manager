import { TASK_PRIORITY_CONFIG, TASK_TYPE_CONFIG } from './constants';

export const TASK_PRIORITY_OPTIONS = TASK_PRIORITY_CONFIG.map(({ id, title }) => ({
  value: id,
  label: title,
}));

export const TASK_TYPE_OPTIONS = TASK_TYPE_CONFIG.map(({ id, title }) => ({
  value: id,
  label: title,
}));
